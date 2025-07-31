import { Buffer } from "buffer";
import joi from "joi";
import { getClaim, getClaims } from "../api/claims.js";
import { getApplication, getApplicationHistory } from "../api/applications.js";
import { getHistoryDetails } from "./models/application-history.js";
import { getStyleClassByStatus } from "../constants/status.js";
import { formatStatusId, upperFirstLetter, formattedDateToUk } from "../lib/display-helper.js";
import { TYPE_OF_LIVESTOCK, PIG_GENETIC_SEQUENCING_VALUES } from "ffc-ahwr-common-library";
import {
  sheepPackages,
  sheepTestTypes,
  sheepTestResultsType,
} from "../constants/sheep-test-types.js";
import { permissions } from "../auth/permissions.js";
import { getCurrentStatusEvent } from "./utils/get-current-status-event.js";
import { getClaimViewStates } from "./utils/get-claim-view-states.js";
import { getErrorMessagesByKey } from "./utils/get-error-messages-by-key.js";
import { getStatusUpdateOptions } from "./utils/get-status-update-options.js";
import { getLivestockTypes } from "../lib/get-livestock-types.js";
import { getReviewType } from "../lib/get-review-type.js";
import { getHerdBreakdown } from "../lib/get-herd-breakdown.js";
import { getHerdRowData } from "../lib/get-herd-row-data.js";
import { config } from "../config/index.js";
import { claimType } from "../constants/claim-type.js";

const { BEEF, PIGS, DAIRY, SHEEP } = TYPE_OF_LIVESTOCK;
const { administrator, authoriser, processor, recommender, user } = permissions;

const backLink = (applicationReference, returnPage, page) => {
  return returnPage === "agreement"
    ? `/agreement/${applicationReference}/claims`
    : `/claims?page=${page}`;
};

const speciesEligibleNumber = {
  beef: "11 or more beef cattle",
  dairy: "11 or more dairy cattle",
  pigs: "51 or more pigs",
  sheep: "21 or more sheep",
};

const returnClaimDetailIfExist = (property, value) => property && value;

const buildKeyValueJson = (keyText, valueText) => ({
  key: { text: keyText },
  value: { text: valueText },
});

export const getPigTestResultRows = (data) => {

  if (data.claimType === claimType.review) {
    return [
      {
        key: { text: "Test result" },
        value: { html: upperFirstLetter(data.testResults) },
      },
    ];
  }

   if (!config.pigUpdatesEnabled) {
    return [
      {
        key: { text: "Disease status category" },
        value: { html: data?.diseaseStatus },
      },
    ];
  }

  const testResultType = upperFirstLetter(data.pigsFollowUpTest);
  const testResult = data[`pigs${testResultType}TestResult`];

  const pigTestResultRows = [
    {
      key: { text: "Test result" },
      value: { html: `${testResultType.toUpperCase()} ${testResult}` },
    },
  ];

  const geneticSequencing = data?.pigsGeneticSequencing;

  if (geneticSequencing) {
    const geneticSequencingLabel = PIG_GENETIC_SEQUENCING_VALUES.find(
      (keyValuePair) => keyValuePair.value === geneticSequencing,
    ).label;

    pigTestResultRows.push({
      key: { text: "Genetic sequencing test results" },
      value: { html: geneticSequencingLabel },
    });
  }

  return pigTestResultRows;
};

const getVaccinationStatusLabel = (vaccinationStatus) => {
  if (!vaccinationStatus) {
    return;
  }

  if (vaccinationStatus === 'notVaccinated') {
    return 'Not vaccinated';
  }

  if (vaccinationStatus === 'vaccinated') {
    return 'Vaccinated';
  }
}

export const viewClaimRoute = {
  method: "get",
  path: "/view-claim/{reference}",
  options: {
    auth: { scope: [administrator, authoriser, processor, recommender, user] },
    validate: {
      params: joi.object({
        reference: joi.string().valid(),
      }),
      query: joi.object({
        page: joi.string().default(1).allow(null),
        returnPage: joi.string().optional().allow("").valid("agreement", "claims"),
        errors: joi.string().allow(null),
        moveToInCheck: joi.bool().default(false),
        recommendToPay: joi.bool().default(false),
        recommendToReject: joi.bool().default(false),
        approve: joi.bool().default(false),
        reject: joi.bool().default(false),
        updateStatus: joi.bool().default(false),
        updateVetsName: joi.bool().default(false),
        updateDateOfVisit: joi.bool().default(false),
        updateVetRCVSNumber: joi.bool().default(false),
      }),
    },
    handler: async (request, h) => {
      const { page, returnPage } = request.query;
      const claim = await getClaim(request.params.reference, request.logger);

      const {
        data,
        reference,
        type,
        applicationReference,
        status: claimStatus,
        statusId,
        createdAt,
        herd,
      } = claim;

      request.logger.setBindings({ applicationReference, reference });

      const application = await getApplication(applicationReference, request.logger);

      const { organisation } = application.data;

      request.logger.setBindings({ sbi: organisation.sbi });

      const isFlagged = application.flags.length > 0;
      const flaggedText = isFlagged ? "Yes" : "No";

      const applicationSummaryDetails = [
        buildKeyValueJson("Agreement number", applicationReference),
        buildKeyValueJson("Agreement date", formattedDateToUk(application.createdAt)),
        buildKeyValueJson("Agreement holder", organisation.farmerName),
        buildKeyValueJson("Agreement holder email", organisation.email),
        buildKeyValueJson("SBI number", organisation.sbi),
        buildKeyValueJson("Address", organisation.address.split(",").join(", ")),
        buildKeyValueJson("Business email", organisation.orgEmail),
        buildKeyValueJson("Flagged", flaggedText),
      ];

      const errors = request.query.errors
        ? JSON.parse(Buffer.from(request.query.errors, "base64").toString("utf8"))
        : [];

      const { historyRecords } = await getApplicationHistory(reference, request.logger);
      const historyDetails = getHistoryDetails(historyRecords);
      const currentStatusEvent = getCurrentStatusEvent(claim, historyRecords);

      const {
        moveToInCheckAction,
        moveToInCheckForm,
        recommendAction,
        recommendToPayForm,
        recommendToRejectForm,
        authoriseAction,
        authoriseForm,
        rejectAction,
        rejectForm,
        updateStatusAction,
        updateStatusForm,
        updateVetsNameAction,
        updateVetsNameForm,
        updateVetRCVSNumberAction,
        updateVetRCVSNumberForm,
        updateDateOfVisitAction,
        updateDateOfVisitForm,
      } = getClaimViewStates(request, claim.statusId, currentStatusEvent);

      const { isBeef, isDairy, isPigs, isSheep } = getLivestockTypes(data?.typeOfLivestock);
      const { isReview, isEndemicsFollowUp } = getReviewType(type);

      const getBiosecurityRow = () =>
        data?.biosecurity &&
        isEndemicsFollowUp &&
        [PIGS, BEEF, DAIRY].includes(data?.typeOfLivestock) && {
          key: { text: "Biosecurity assessment" },
          value: {
            html:
              data?.typeOfLivestock === PIGS
                ? upperFirstLetter(
                    `${data?.biosecurity?.biosecurity}, Assessment percentage: ${data?.biosecurity?.assessmentPercentage}%`,
                  )
                : upperFirstLetter(data?.biosecurity),
          },
        };

      const getSheepDiseasesTestedRow = () =>
        data?.typeOfLivestock === SHEEP &&
        isEndemicsFollowUp &&
        typeof data.testResults === "object" &&
        data.testResults.length
          ? data.testResults.map((sheepTest, index) => {
              return {
                key: {
                  text: index === 0 ? "Disease or condition test result" : "",
                },
                value: {
                  html:
                    typeof sheepTest.result === "object"
                      ? sheepTest.result
                          .map(
                            (testResult) => `${testResult.diseaseType} (${testResult.result})</br>`,
                          )
                          .join(" ")
                      : `${sheepTestTypes[data?.sheepEndemicsPackage].find((test) => test.value === sheepTest.diseaseType)?.text} (${sheepTestResultsType[sheepTest.diseaseType].find((resultType) => resultType.value === sheepTest.result).text})`,
                },
              };
            })
          : [];

      const getAction = (createItems, query, visuallyHiddenText, id) => {
        if (!createItems) {
          return null;
        }

        return {
          items: [
            {
              href: `/view-claim/${reference}?${query}=true&page=${page}&returnPage=${returnPage}#${id}`,
              text: "Change",
              visuallyHiddenText,
            },
          ],
        };
      };
      const statusActions = getAction(
        updateStatusAction,
        "updateStatus",
        "status",
        "update-status",
      );
      const dateOfVisitActions = getAction(
        updateDateOfVisitAction,
        "updateDateOfVisit",
        "date of review",
        "update-date-of-visit",
      );
      const vetsNameActions = getAction(
        updateVetsNameAction,
        "updateVetsName",
        "vet's name",
        "update-vets-name",
      );
      const vetRCVSNumberActions = getAction(
        updateVetRCVSNumberAction,
        "updateVetRCVSNumber",
        "RCVS number",
        "update-vet-rcvs-number",
      );
      const statusOptions = getStatusUpdateOptions(statusId);

      const status = {
        key: { text: "Status" },
        value: {
          html: `<span class='app-long-tag'><span class='govuk-tag responsive-text ${getStyleClassByStatus(formatStatusId(statusId))}'> ${upperFirstLetter(claimStatus.toLowerCase())} </span></span>`,
        },
        actions: statusActions,
      };
      const claimDate = {
        key: { text: "Claim date" },
        value: { html: formattedDateToUk(createdAt) },
      };
      const organisationName = {
        key: { text: "Business name" },
        value: { html: upperFirstLetter(organisation?.name) },
      };
      const livestock = {
        key: { text: "Livestock" },
        value: {
          html: upperFirstLetter(
            [PIGS, SHEEP].includes(data?.typeOfLivestock)
              ? data?.typeOfLivestock
              : `${data?.typeOfLivestock} cattle`,
          ),
        },
      };
      const typeOfVisit = {
        key: { text: "Type of visit" },
        value: {
          html: isReview ? "Animal health and welfare review" : "Endemic disease follow-ups",
        },
      };
      const dateOfVisit = {
        key: { text: "Date of visit" },
        value: { html: formattedDateToUk(data?.dateOfVisit) },
        actions: dateOfVisitActions,
      };
      const dateOfSampling = {
        key: { text: "Date of sampling" },
        value: {
          html: data?.dateOfTesting && formattedDateToUk(data?.dateOfTesting),
        },
      };
      const typeOfLivestock = {
        key: { text: speciesEligibleNumber[data?.typeOfLivestock] },
        value: { html: upperFirstLetter(data?.speciesNumbers) },
      };
      const vetName = {
        key: { text: "Vet's name" },
        value: { html: upperFirstLetter(data?.vetsName) },
        actions: vetsNameActions,
      };
      const vetRCVSNumber = {
        key: { text: "Vet's RCVS number" },
        value: { html: data?.vetRCVSNumber },
        actions: vetRCVSNumberActions,
      };
      const piHunt = {
        key: { text: "PI hunt" },
        value: { html: upperFirstLetter(data?.piHunt) },
      };
      const laboratoryURN = {
        key: { text: isBeef || isDairy ? "URN or test certificate" : "URN" },
        value: { html: data?.laboratoryURN },
      };
      const numberOfOralFluidSamples = {
        key: { text: "Number of oral fluid samples taken" },
        value: { html: data?.numberOfOralFluidSamples },
      };
      const numberAnimalsTested = {
        key: { text: "Number of animals tested" },
        value: { html: data?.numberAnimalsTested },
      };
      const reviewTestResults = {
        key: { text: "Review test result" },
        value: { html: upperFirstLetter(data?.reviewTestResults) },
      };
      const testResults = returnClaimDetailIfExist(
        data?.testResults && typeof data?.testResults === "string",
        {
          key: {
            text: data?.reviewTestResults ? "Follow-up test result" : "Test result",
          },
          value: { html: upperFirstLetter(data?.testResults) },
        },
      );
      const vetVisitsReviewTestResults = {
        key: { text: "Vet Visits Review Test results" },
        value: { html: upperFirstLetter(data?.vetVisitsReviewTestResults) },
      };
      const diseaseStatus = {
        key: { text: "Disease status category" },
        value: { html: data?.diseaseStatus },
      };
      const numberOfSamplesTested = {
        key: { text: "Samples tested" },
        value: { html: data?.numberOfSamplesTested },
      };
      const herdVaccinationStatus = {
        key: { text: "Herd vaccination status" },
        value: { html: getVaccinationStatusLabel(data?.herdVaccinationStatus) },
      };
      const sheepEndemicsPackage = {
        key: { text: "Sheep health package" },
        value: {
          html: upperFirstLetter(sheepPackages[data?.sheepEndemicsPackage]),
        },
      };
      const piHuntRecommendedRow = {
        key: { text: "Vet recommended PI hunt" },
        value: { html: upperFirstLetter(data?.piHuntRecommended) },
      };
      const piHuntAllAnimalsRow = {
        key: { text: "PI hunt done on all cattle in herd" },
        value: { html: upperFirstLetter(data?.piHuntAllAnimals) },
      };

      const herdRowData = getHerdRowData(herd, isSheep);

      const pigFollowUpTestResultRows = getPigTestResultRows(data)

      // There are more common rows than this, but the ordering matters and things get more complicated after these
      const commonRows = [
        status,
        claimDate,
        organisationName,
        livestock,
        typeOfVisit,
        dateOfVisit,
        ...herdRowData,
      ];

      const commonCowRows = [
        ...commonRows.slice(0, commonRows.indexOf(typeOfVisit)),
        reviewTestResults,
        ...commonRows.slice(commonRows.indexOf(typeOfVisit)),
      ];

      const beefRows = [
        ...commonCowRows,
        isReview && dateOfSampling,
        typeOfLivestock,
        vetName,
        vetRCVSNumber,
        piHunt,
        piHuntRecommendedRow,
        piHuntAllAnimalsRow,
        isEndemicsFollowUp && dateOfSampling,
        laboratoryURN,
        testResults,
        getBiosecurityRow(),
      ];

      const dairyRows = [
        ...commonCowRows,
        isReview && dateOfSampling,
        typeOfLivestock,
        vetName,
        vetRCVSNumber,
        piHunt,
        piHuntRecommendedRow,
        piHuntAllAnimalsRow,
        isEndemicsFollowUp && dateOfSampling,
        laboratoryURN,
        testResults,
        getBiosecurityRow(),
      ];

      const sheepRows = [
        ...commonRows,
        dateOfSampling,
        typeOfLivestock,
        vetName,
        vetRCVSNumber,
        laboratoryURN,
        numberAnimalsTested,
        testResults,
        vetVisitsReviewTestResults,
        diseaseStatus,
        numberOfSamplesTested,
        herdVaccinationStatus,
        sheepEndemicsPackage,
        getBiosecurityRow(),
        ...getSheepDiseasesTestedRow(),
      ];

      const pigRows = [
        ...commonRows,
        dateOfSampling,
        typeOfLivestock,
        numberOfOralFluidSamples,
        vetName,
        vetRCVSNumber,
        piHunt,
        numberAnimalsTested,
        reviewTestResults,
        herdVaccinationStatus,
        laboratoryURN,
        numberOfSamplesTested,
        ...pigFollowUpTestResultRows,
        getBiosecurityRow(),
      ];

      const speciesRows = () => {
        switch (true) {
          case isBeef:
            return beefRows;
          case isDairy:
            return dairyRows;
          case isPigs:
            return pigRows;
          case isSheep:
            return sheepRows;
          default:
            return [];
        }
      };

      const rows = [...speciesRows()];
      const rowsWithData = rows.filter((row) => row?.value?.html);
      const errorMessages = getErrorMessagesByKey(errors);
      const searchText = applicationReference;
      const searchType = "appRef";
      const limit = 30;
      const offset = 0;
      const { claims } = await getClaims(
        searchType,
        searchText,
        undefined,
        limit,
        offset,
        undefined,
        request.logger,
      );

      return h.view("view-claim", {
        page,
        backLink: backLink(applicationReference, returnPage, page),
        returnPage,
        isFlagged,
        reference,
        applicationReference,
        claimOrAgreement: "claim",
        title: upperFirstLetter(application.data.organisation.name),
        claimSummaryDetails: rowsWithData,
        status: {
          normalType: upperFirstLetter(formatStatusId(claim.statusId).toLowerCase()),
          tagClass: getStyleClassByStatus(formatStatusId(claim.statusId)),
        },
        applicationSummaryDetails,
        historyDetails,
        moveToInCheckAction,
        moveToInCheckForm,
        recommendAction,
        recommendToPayForm,
        recommendToRejectForm,
        rejectAction,
        rejectForm,
        authoriseAction,
        authoriseForm,
        updateStatusForm,
        updateVetsNameForm,
        updateVetRCVSNumberForm,
        updateDateOfVisitForm,
        statusOptions,
        errorMessages,
        errors,
        ...getHerdBreakdown(claims),
      });
    },
  },
};
