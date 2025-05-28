const { Buffer } = require("buffer");
const joi = require("joi");
const { getClaim, getClaims } = require("../api/claims");
const { getApplication, getApplicationHistory } = require("../api/applications");
const { getHistoryDetails } = require("./models/application-history");
const { getStyleClassByStatus } = require("../constants/status");
const { formatStatusId } = require("../lib/display-helper");
const { livestockTypes } = require("../constants/claim");
const {
  sheepPackages,
  sheepTestTypes,
  sheepTestResultsType,
} = require("../constants/sheep-test-types");
const { administrator, authoriser, processor, recommender, user } = require("../auth/permissions");
const { upperFirstLetter, formattedDateToUk } = require("../lib/display-helper");
const { getCurrentStatusEvent } = require("./utils/get-current-status-event");
const { getClaimViewStates } = require("./utils/get-claim-view-states");
const { getErrorMessagesByKey } = require("./utils/get-error-messages-by-key");
const { getStatusUpdateOptions } = require("./utils/get-status-update-options");
const { getLivestockTypes } = require("../lib/get-livestock-types");
const { getReviewType } = require("../lib/get-review-type");
const { getHerdBreakdown } = require("../lib/get-herd-breakdown");
const { getHerdRowData } = require("../lib/get-herd-row-data");

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

module.exports = {
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
        [livestockTypes.pigs, livestockTypes.beef, livestockTypes.dairy].includes(
          data?.typeOfLivestock,
        ) && {
          key: { text: "Biosecurity assessment" },
          value: {
            html:
              data?.typeOfLivestock === livestockTypes.pigs
                ? upperFirstLetter(
                    `${data?.biosecurity?.biosecurity}, Assessment percentage: ${data?.biosecurity?.assessmentPercentage}%`,
                  )
                : upperFirstLetter(data?.biosecurity),
          },
        };

      const getSheepDiseasesTestedRow = () =>
        data?.typeOfLivestock === livestockTypes.sheep &&
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
            [livestockTypes.pigs, livestockTypes.sheep].includes(data?.typeOfLivestock)
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
        value: { html: upperFirstLetter(data?.herdVaccinationStatus) },
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

      // There are more common rows than this, but the ordering matters and things get more complicated after these
      const commonRows = [
        status,
        claimDate,
        organisationName,
        livestock,
        typeOfVisit,
        dateOfVisit,
        ...getHerdRowData(herd, isSheep),
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
        diseaseStatus,
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
