const { Buffer } = require('buffer')
const Joi = require('joi')
const boom = require('@hapi/boom')
const { getClaim } = require('../api/claims')
const { claims } = require('./../config/routes')
const { getApplication, getApplicationHistory } = require('../api/applications')
const getApplicationHistoryModel = require('./models/application-history')
const { getStyleClassByStatus } = require('../constants/status')
const { formatStatusId } = require('./../lib/display-helper')
const { livestockTypes, claimType } = require('./../constants/claim')
const getRecommendData = require('./models/recommend-claim')
const { sheepTestTypes, sheepTestResultsType } = require('./../constants/sheep-test-types')
const { administrator, authoriser, processor, recommender, user } = require('../auth/permissions')

const { upperFirstLetter, formatedDateToUk } = require('../lib/display-helper')
const claimFormHelper = require('./utils/claim-form-helper')
const checkboxErrors = require('./utils/checkbox-errors')

const backLink = (applicationReference) => {
  return `/${claims}/${applicationReference}`
}

const speciesEligibleNumber = {
  beef: '11 or more beef cattle ',
  dairy: '11 or more dairy cattle ',
  pigs: '51 or more pigs',
  sheep: '21 or more sheep'
}

const returnClaimDetailIfExist = (property, value) => property && value
const claimSummaryDetails = (organisation, data, type) => [
  (returnClaimDetailIfExist(organisation?.name, { key: { text: 'Business name' }, value: { html: upperFirstLetter(organisation?.name) } })),
  (returnClaimDetailIfExist(data?.typeOfLivestock, { key: { text: 'Livestock' }, value: { html: upperFirstLetter([livestockTypes.pigs, livestockTypes.sheep].includes(data?.typeOfLivestock) ? data?.typeOfLivestock : `${data?.typeOfLivestock} cattle`) } })),
  (returnClaimDetailIfExist(type, { key: { text: 'Type of review' }, value: { html: type === claimType.review ? 'Annual health and welfare review' : 'Endemic disease follow-ups' } })),
  (returnClaimDetailIfExist(data?.dateOfVisit, { key: { text: 'Date of visit' }, value: { html: formatedDateToUk(data?.dateOfVisit) } })),
  (returnClaimDetailIfExist(data?.dateOfTesting, { key: { text: 'Date of testing' }, value: { html: formatedDateToUk(data?.dateOfTesting) } })),
  (returnClaimDetailIfExist(data?.speciesNumbers, { key: { text: speciesEligibleNumber[data?.typeOfLivestock] }, value: { html: upperFirstLetter(data?.speciesNumbers) } })),
  (returnClaimDetailIfExist(data?.vetsName, { key: { text: "Vet's name" }, value: { html: upperFirstLetter(data?.vetsName) } })),
  (returnClaimDetailIfExist(data?.vetRCVSNumber, { key: { text: "Vet's RCVS number" }, value: { html: data?.vetRCVSNumber } })),
  (returnClaimDetailIfExist(data?.laboratoryURN, { key: { text: 'Test results URN' }, value: { html: data?.laboratoryURN } })),
  (returnClaimDetailIfExist(data?.numberOfOralFluidSamples, { key: { text: 'Number of tests' }, value: { html: data?.numberOfOralFluidSamples } })),
  (returnClaimDetailIfExist(data?.numberAnimalsTested, { key: { text: 'Number of animals tested' }, value: { html: data?.numberAnimalsTested } })),
  (returnClaimDetailIfExist(data?.reviewTestResults, { key: { text: 'Review test result' }, value: { html: upperFirstLetter(data?.reviewTestResults) } })),
  (returnClaimDetailIfExist(data?.testResults && typeof data?.testResults === 'string', { key: { text: data?.reviewTestResults ? 'Endemics test result' : 'Test result' }, value: { html: typeof data?.testResults === 'string' ? upperFirstLetter(data?.testResults) : '' } })),
  (returnClaimDetailIfExist(data?.vetVisitsReviewTestResults, { key: { text: 'Vet Visits Review Test results' }, value: { html: upperFirstLetter(data?.vetVisitsReviewTestResults) } })),
  (returnClaimDetailIfExist(data?.diseaseStatus, { key: { text: 'Diseases status category' }, value: { html: data?.diseaseStatus } })),
  (returnClaimDetailIfExist(data?.numberOfSamplesTested, { key: { text: 'Samples tested' }, value: { html: data?.numberOfSamplesTested } })),
  (returnClaimDetailIfExist(data?.herdVaccinationStatus, { key: { text: 'Herd vaccination status' }, value: { html: upperFirstLetter(data?.herdVaccinationStatus) } })),
  (returnClaimDetailIfExist(data?.sheepEndemicsPackage, { key: { text: 'Endemics package' }, value: { html: upperFirstLetter(data?.sheepEndemicsPackage) } })),
  (data?.biosecurity && type === claimType.endemics && [livestockTypes.pigs, livestockTypes.beef, livestockTypes.dairy].includes(data?.typeOfLivestock) &&
    {
      key: { text: 'Biosecurity assessment' },
      value: {
        html:
        data?.typeOfLivestock === livestockTypes.pigs
          ? upperFirstLetter(`${data?.biosecurity?.biosecurity}, Assessment percentage: ${data?.biosecurity?.assessmentPercentage}%`)
          : upperFirstLetter(data?.biosecurity)
      }
    }
  ),
  ...(data?.typeOfLivestock === livestockTypes.sheep && type === claimType.endemics && typeof data?.testResults === 'object' && data?.testResults?.length
    ? (data?.testResults || []).map((sheepTest, index) => {
        return {
          key: { text: index === 0 ? 'Disease test and result' : '' },
          value: {
            html: typeof sheepTest.result === 'object'
              ? sheepTest.result.map((testResult) => `${testResult.diseaseType} (${testResult.testResult})</br>`).join(' ')
              : `${sheepTestTypes[data?.sheepEndemicsPackage].find((test) => test.value === sheepTest.diseaseType).text} (${
                    sheepTestResultsType[sheepTest.diseaseType].find((resultType) => resultType.value === sheepTest.result).text
                  })`
          }
        }
      })
    : [])
]

module.exports = {
  method: 'GET',
  path: '/view-claim/{reference}',
  options: {
    auth: { scope: [administrator, authoriser, processor, recommender, user] },
    validate: {
      params: Joi.object({
        reference: Joi.string().valid()
      }),
      query: Joi.object({
        errors: Joi.string().allow(null),
        approve: Joi.bool().default(false),
        reject: Joi.bool().default(false),
        recommendToPay: Joi.bool().default(false),
        recommendToReject: Joi.bool().default(false),
        moveToInCheck: Joi.bool().default(false)
      })
    },
    handler: async (request, h) => {
      const claim = await getClaim(request.params.reference)

      if (!claim) {
        throw boom.badRequest()
      }

      const { data, reference, type, applicationReference } = claim
      const application = await getApplication(applicationReference)

      if (!application) {
        throw boom.badRequest()
      }

      const organisation = application?.data?.organisation
      const applicationSummaryDetails = [
        { key: { text: 'Name' }, value: { text: organisation?.farmerName } },
        { key: { text: 'SBI number' }, value: { text: organisation?.sbi } },
        { key: { text: 'Address' }, value: { text: organisation?.address } },
        { key: { text: 'Email address' }, value: { text: organisation?.email } },
        { key: { text: 'Organisation email address' }, value: { text: organisation?.orgEmail } }
      ]

      const {
        displayRecommendationForm,
        displayRecommendToPayConfirmationForm,
        displayRecommendToRejectConfirmationForm,
        displayAuthoriseToPayConfirmationForm,
        displayAuthoriseToRejectConfirmationForm,
        displayMoveToInCheckFromHold,
        displayOnHoldConfirmationForm
      } = await claimFormHelper(request, request.params.reference, claim.statusId)

      const errors = request.query.errors
        ? JSON.parse(Buffer.from(request.query.errors, 'base64').toString('utf8'))
        : []

      const recommend = {
        displayRecommendToPayConfirmationForm,
        displayRecommendToRejectConfirmationForm,
        errorMessage: checkboxErrors(errors, 'pnl-recommend-confirmation')
      }

      const applicationHistory = await getApplicationHistory(reference)
      const historyData = getApplicationHistoryModel(applicationHistory)

      return h.view('view-claim', {
        page: 1,
        backLink: backLink(claim?.applicationReference),
        reference,
        title: upperFirstLetter(application?.data?.organisation?.name),
        claimSummaryDetails: claimSummaryDetails(organisation, data, type),
        status: { capitalisedtype: formatStatusId(claim.statusId), normalType: upperFirstLetter(formatStatusId(claim.statusId).toLowerCase()), tagClass: getStyleClassByStatus(formatStatusId(claim.statusId)) },
        applicationSummaryDetails,
        historyData,
        recommendData: Object.entries(getRecommendData(recommend)).length === 0 ? false : getRecommendData(recommend),
        recommendForm: displayRecommendationForm,
        authorisePaymentConfirmForm: {
          display: displayAuthoriseToPayConfirmationForm,
          errorMessage: checkboxErrors(errors, 'authorise-payment-panel')
        },
        rejectClaimConfirmForm: {
          display: displayAuthoriseToRejectConfirmationForm,
          errorMessage: checkboxErrors(errors, 'reject-claim-panel')
        },
        onHoldConfirmationForm: {
          display: displayOnHoldConfirmationForm,
          errorMessage: checkboxErrors(errors, 'confirm-move-to-in-check-panel')
        },
        displayMoveToInCheckFromHold,
        errors
      })
    }
  }
}
