const { Buffer } = require("buffer");
const joi = require("joi");
const { getClaim } = require("../api/claims");
const {
  getApplication,
  getApplicationHistory,
} = require("../api/applications");
const { getHistoryDetails } = require("./models/application-history");
const { getStyleClassByStatus } = require("../constants/status");
const { formatStatusId } = require("../lib/display-helper");
const { livestockTypes } = require("../constants/claim");
const {
  sheepPackages,
  sheepTestTypes,
  sheepTestResultsType,
} = require("../constants/sheep-test-types");
const {
  administrator,
  authoriser,
  processor,
  recommender,
  user,
} = require("../auth/permissions");
const { upperFirstLetter, formatedDateToUk } = require("../lib/display-helper");
const { getCurrentStatusEvent } = require("./utils/get-current-status-event");
const { getClaimViewStates } = require("./utils/get-claim-view-states");
const { getErrorMessagesByKey } = require("./utils/get-error-messages-by-key");
const { getStatusUpdateOptions } = require("./utils/get-status-update-options");
const { getLivestockTypes } = require("../lib/get-livestock-types");
const { getReviewType } = require("../lib/get-review-type");

const backLink = (applicationReference, returnPage, page) => {
  return returnPage === "agreement"
    ? `/agreement/${applicationReference}/claims`
    : `/claims?page=${page}`;
};

const speciesEligibleNumber = {
  beef: "11 or more beef cattle ",
  dairy: "11 or more dairy cattle ",
  pigs: "51 or more pigs",
  sheep: "21 or more sheep",
};

const returnClaimDetailIfExist = (property, value) => property && value;

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
        returnPage: joi
          .string()
          .optional()
          .allow("")
          .valid("agreement", "claims"),
        errors: joi.string().allow(null),
        moveToInCheck: joi.bool().default(false),
        recommendToPay: joi.bool().default(false),
        recommendToReject: joi.bool().default(false),
        approve: joi.bool().default(false),
        reject: joi.bool().default(false),
        updateStatus: joi.bool().default(false),
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
      } = claim;

      request.logger.setBindings({ applicationReference, reference });

      const application = await getApplication(
        applicationReference,
        request.logger,
      );

      const { organisation } = application.data;

      request.logger.setBindings({ sbi: organisation.sbi });

      const applicationSummaryDetails = [
        {
          key: { text: "Agreement number" },
          value: { text: applicationReference },
        },
        {
          key: { text: "Agreement date" },
          value: { text: formatedDateToUk(application.createdAt) },
        },
        { key: { text: "Business name" }, value: { text: organisation.name } },
        {
          key: { text: "Agreement holder email" },
          value: { text: organisation.email },
        },
        { key: { text: "SBI number" }, value: { text: organisation.sbi } },
        { key: { text: "Address" }, value: { text: organisation.address } },
        {
          key: { text: "Business email" },
          value: { text: organisation.orgEmail },
        },
      ];

      const errors = request.query.errors
        ? JSON.parse(
            Buffer.from(request.query.errors, "base64").toString("utf8"),
          )
        : [];

      const claimHistory = await getApplicationHistory(
        reference,
        request.logger,
      );
      const historyDetails = getHistoryDetails(claimHistory);
      const currentStatusEvent = getCurrentStatusEvent(claim, claimHistory);

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
      } = getClaimViewStates(request, claim.statusId, currentStatusEvent);

      const { isBeef, isDairy, isPigs, isSheep } = getLivestockTypes(
        data?.typeOfLivestock,
      );
      const { isReview, isEndemicsFollowUp } = getReviewType(type);

      const getBiosecurityRow = () =>
        data?.biosecurity &&
        isEndemicsFollowUp &&
        [
          livestockTypes.pigs,
          livestockTypes.beef,
          livestockTypes.dairy,
        ].includes(data?.typeOfLivestock) && {
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
                            (testResult) =>
                              `${testResult.diseaseType} (${testResult.result})</br>`,
                          )
                          .join(" ")
                      : `${sheepTestTypes[data?.sheepEndemicsPackage].find((test) => test.value === sheepTest.diseaseType)?.text} (${sheepTestResultsType[sheepTest.diseaseType].find((resultType) => resultType.value === sheepTest.result).text})`,
                },
              };
            })
          : [];

      const actions = updateStatusAction
        ? {
            items: [
              {
                href: `/view-claim/${reference}?updateStatus=true&page=${page}&returnPage=${returnPage}#update-status`,
                text: "Change",
                visuallyHiddenText: "status",
              },
            ],
          }
        : null;
      const statusOptions = getStatusUpdateOptions(statusId);

      const status = {
        key: { text: "Status" },
        value: {
          html: `<span class='app-long-tag'><span class='govuk-tag ${getStyleClassByStatus(formatStatusId(statusId))}'> ${upperFirstLetter(claimStatus?.status.toLowerCase())} </span></span>`,
        },
        actions,
      };
      const claimDate = {
        key: { text: "Claim date" },
        value: { html: formatedDateToUk(createdAt) },
      };
      const organisationName = {
        key: { text: "Business name" },
        value: { html: upperFirstLetter(organisation?.name) },
      };
      const livestock = {
        key: { text: "Livestock" },
        value: {
          html: upperFirstLetter(
            [livestockTypes.pigs, livestockTypes.sheep].includes(
              data?.typeOfLivestock,
            )
              ? data?.typeOfLivestock
              : `${data?.typeOfLivestock} cattle`,
          ),
        },
      };
      const typeOfVisit = {
        key: { text: "Type of visit" },
        value: {
          html: isReview
            ? "Animal health and welfare review"
            : "Endemic disease follow-ups",
        },
      };
      const dateOfVisit = {
        key: { text: "Date of visit" },
        value: { html: formatedDateToUk(data?.dateOfVisit) },
      };
      const dateOfSampling = {
        key: { text: "Date of sampling" },
        value: {
          html: data?.dateOfTesting && formatedDateToUk(data?.dateOfTesting),
        },
      };
      const typeOfLivestock = {
        key: { text: speciesEligibleNumber[data?.typeOfLivestock] },
        value: { html: upperFirstLetter(data?.speciesNumbers) },
      };
      const vetName = {
        key: { text: "Vet's name" },
        value: { html: upperFirstLetter(data?.vetsName) },
      };
      const vetRCVSNumber = {
        key: { text: "Vet's RCVS number" },
        value: { html: data?.vetRCVSNumber },
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
            text: data?.reviewTestResults
              ? "Follow-up test result"
              : "Test result",
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

      const beefRows = [
        status,
        claimDate,
        organisationName,
        livestock,
        typeOfVisit,
        reviewTestResults,
        dateOfVisit,
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
        status,
        claimDate,
        organisationName,
        livestock,
        typeOfVisit,
        reviewTestResults,
        dateOfVisit,
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
        status,
        claimDate,
        organisationName,
        livestock,
        typeOfVisit,
        dateOfVisit,
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
        status,
        claimDate,
        organisationName,
        livestock,
        typeOfVisit,
        dateOfVisit,
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

      return h.view("view-claim", {
        page,
        backLink: backLink(applicationReference, returnPage, page),
        returnPage,
        reference,
        applicationReference,
        claimOrAgreement: "claim",
        title: upperFirstLetter(application.data.organisation.name),
        claimSummaryDetails: rowsWithData,
        contactPerson: currentStatusEvent?.ChangedBy,
        status: {
          capitalisedtype: formatStatusId(claim.statusId),
          normalType: upperFirstLetter(
            formatStatusId(claim.statusId).toLowerCase(),
          ),
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
        statusOptions,
        errorMessages,
        errors,
      });
    },
  },
};
