const { Buffer } = require('buffer')
const Joi = require('joi')
const boom = require('@hapi/boom')
const { getClaim } = require('../api/claims')
const { getApplication, getApplicationHistory } = require('../api/applications')
const getApplicationHistoryModel = require('./models/application-history')
const { getStyleClassByStatus } = require('../constants/status')
const { formatStatusId } = require('./../lib/display-helper')
const { livestockTypes } = require('./../constants/claim')
const getRecommendData = require('./models/recommend-claim')
const { sheepTestTypes, sheepTestResultsType } = require('./../constants/sheep-test-types')
const { administrator, authoriser, processor, recommender, user } = require('../auth/permissions')
const { getStageExecutionByApplication } = require('../api/stage-execution')
const { upperFirstLetter, formatedDateToUk } = require('../lib/display-helper')
const claimFormHelper = require('./utils/claim-form-helper')
const checkboxErrors = require('./utils/checkbox-errors')
const { getLivestockTypes } = require('./../lib/get-livestock-types')
const { getReviewType } = require('./../lib/get-review-type')
const { convertDateToFormattedString } = require('./../routes/utils/date-converter')

const claimsLink = '/claims'
const getBackLink = (applicationReference, returnPage) => {
  return returnPage && returnPage === 'claims' ? claimsLink : `/agreement/${applicationReference}/claims`
}
const speciesEligibleNumber = {
  beef: '11 or more beef cattle ',
  dairy: '11 or more dairy cattle ',
  pigs: '51 or more pigs',
  sheep: '21 or more sheep'
}

const returnClaimDetailIfExist = (property, value) => property && value

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
        moveToInCheck: Joi.bool().default(false),
        returnPage: Joi.string().allow(null)
      })
    },
    handler: async (request, h) => {
      const claim = await getClaim(request.params.reference)

      if (!claim) {
        throw boom.badRequest()
      }

      const { data, reference, type, applicationReference, status: claimStatus, statusId, createdAt } = claim
      const application = await getApplication(applicationReference)

      if (!application) {
        throw boom.badRequest()
      }

      const organisation = application?.data?.organisation

      const applicationSummaryDetails = [
        { key: { text: 'Agreement number' }, value: { text: applicationReference } },
        { key: { text: 'Agreement date' }, value: { text: formatedDateToUk(application.createdAt) } },
        { key: { text: 'Agreement holder' }, value: { text: organisation?.farmerName } },
        { key: { text: 'Agreement holder email' }, value: { text: organisation?.email } },
        { key: { text: 'SBI number' }, value: { text: organisation?.sbi } },
        { key: { text: 'Address' }, value: { text: organisation?.address } },
        { key: { text: 'Business email' }, value: { text: organisation?.orgEmail } }
      ]

      const {
        displayRecommendationForm,
        displayRecommendToPayConfirmationForm,
        displayRecommendToRejectConfirmationForm,
        displayAuthoriseOrRejectForm,
        displayAuthorisePaymentButton,
        displayAuthoriseToPayConfirmationForm,
        displayAuthoriseToRejectConfirmationForm,
        displayMoveToInCheckFromHold,
        displayOnHoldConfirmationForm
      } = await claimFormHelper(request, request.params.reference, claim.statusId, 'claim')

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
      const { isBeef, isDairy, isPigs, isSheep } = getLivestockTypes(data?.typeOfLivestock)
      const { isReview, isEndemicsFollowUp } = getReviewType(type)

      const stageExecutionData = await getStageExecutionByApplication(request.params.reference)
      const contactPerson = stageExecutionData?.[0]?.executedBy
      const getBiosecurityRow = () => (data?.biosecurity && isEndemicsFollowUp && [livestockTypes.pigs, livestockTypes.beef, livestockTypes.dairy].includes(data?.typeOfLivestock) &&
      {
        key: { text: 'Biosecurity assessment' },
        value: {
          html:
            data?.typeOfLivestock === livestockTypes.pigs
              ? upperFirstLetter(`${data?.biosecurity?.biosecurity}, Assessment percentage: ${data?.biosecurity?.assessmentPercentage}%`)
              : upperFirstLetter(data?.biosecurity)
        }
      }
      )

      const getSheepDiseasesTestedRow = () => (data?.typeOfLivestock === livestockTypes.sheep && isEndemicsFollowUp && typeof data?.testResults === 'object' && data?.testResults?.length
        ? (data?.testResults || []).map((sheepTest, index) => {
            return {
              key: { text: index === 0 ? 'Disease or condition test result' : '' },
              value: {
                html: typeof sheepTest.result === 'object'
                  ? sheepTest.result.map((testResult) => `${testResult.diseaseType} (${testResult.result})</br>`).join(' ')
                  : `${sheepTestTypes[data?.sheepEndemicsPackage].find((test) => test.value === sheepTest.diseaseType).text} (${sheepTestResultsType[sheepTest.diseaseType].find(resultType => resultType.value === sheepTest.result).text})`
              }
            }
          })
        : [])

      const status = { key: { text: 'Status' }, value: { html: `<span class='govuk-tag ${getStyleClassByStatus(formatStatusId(statusId))}'> ${upperFirstLetter(claimStatus?.status)} </span>` } }
      const claimDate = { key: { text: 'Claim date' }, value: { html: convertDateToFormattedString(createdAt) } }
      const organisationName = { key: { text: 'Business name' }, value: { html: upperFirstLetter(organisation?.name) } }
      const livestock = { key: { text: 'Livestock' }, value: { html: upperFirstLetter([livestockTypes.pigs, livestockTypes.sheep].includes(data?.typeOfLivestock) ? data?.typeOfLivestock : `${data?.typeOfLivestock} cattle`) } }
      const typeOfVisit = { key: { text: 'Type of visit' }, value: { html: isReview ? 'Animal health and welfare review' : 'Endemic disease follow-ups' } }
      const dateOfVisit = { key: { text: 'Date of visit' }, value: { html: formatedDateToUk(data?.dateOfVisit) } }
      const dateOfSampling = { key: { text: 'Date of sampling' }, value: { html: data?.dateOfTesting && formatedDateToUk(data?.dateOfTesting) } }
      const typeOfLivestock = { key: { text: speciesEligibleNumber[data?.typeOfLivestock] }, value: { html: upperFirstLetter(data?.speciesNumbers) } }
      const vetName = { key: { text: "Vet's name" }, value: { html: upperFirstLetter(data?.vetsName) } }
      const vetRCVSNumber = { key: { text: "Vet's RCVS number" }, value: { html: data?.vetRCVSNumber } }
      const piHunt = { key: { text: 'PI hunt' }, value: { html: upperFirstLetter(data?.piHunt) } }
      const laboratoryURN = { key: { text: isBeef || isDairy ? 'URN or test certificate' : 'URN' }, value: { html: data?.laboratoryURN } }
      const numberOfOralFluidSamples = { key: { text: 'Number of oral fluid samples taken' }, value: { html: data?.numberOfOralFluidSamples } }
      const numberAnimalsTested = { key: { text: 'Number of animals tested' }, value: { html: data?.numberAnimalsTested } }
      const reviewTestResults = { key: { text: 'Review test result' }, value: { html: upperFirstLetter(data?.reviewTestResults) } }
      const testResults = (
        returnClaimDetailIfExist(
          data?.testResults && typeof data?.testResults === 'string',
          { key: { text: data?.reviewTestResults ? 'Follow-up test result' : 'Test result' }, value: { html: upperFirstLetter(data?.testResults) } }
        )
      )
      const vetVisitsReviewTestResults = { key: { text: 'Vet Visits Review Test results' }, value: { html: upperFirstLetter(data?.vetVisitsReviewTestResults) } }
      const diseaseStatus = { key: { text: 'Disease status category' }, value: { html: data?.diseaseStatus } }
      const numberOfSamplesTested = { key: { text: 'Samples tested' }, value: { html: data?.numberOfSamplesTested } }
      const herdVaccinationStatus = { key: { text: 'Herd vaccination status' }, value: { html: upperFirstLetter(data?.herdVaccinationStatus) } }
      const sheepEndemicsPackage = { key: { text: 'Endemics package' }, value: { html: upperFirstLetter(data?.sheepEndemicsPackage) } }
      const piHuntRecommendedRow = {
        key: { text: 'Vet recommended PI hunt' },
        value: { html: upperFirstLetter(data?.piHuntRecommended) }
      }
      const piHuntAllAnimalsRow = {
        key: { text: 'PI hunt done on all cattle in herd' },
        value: { html: upperFirstLetter(data?.piHuntAllAnimals) }
      }

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
        getBiosecurityRow()
      ]

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
        getBiosecurityRow()
      ]

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
        ...getSheepDiseasesTestedRow()
      ]

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
        getBiosecurityRow()
      ]

      const speciesRows = () => {
        switch (true) {
          case isBeef:
            return beefRows
          case isDairy:
            return dairyRows
          case isPigs:
            return pigRows
          case isSheep:
            return sheepRows
          default:
            return []
        }
      }

      const rows = [
        ...speciesRows()
      ]
      const rowsWithData = rows.filter((row) => row?.value?.html)
      const backLink = getBackLink(claim?.applicationReference, request.query.returnPage)

      const businessNameLink = (() => {
        return backLink === claimsLink ? claimsLink : `/agreement/${claim?.applicationReference}/claims?page=1`
      })()
      return h.view('view-claim', {
        page: 1,
        backLink,
        businessNameLink,
        returnPage: request.query.returnPage,
        reference,
        applicationReference,
        title: upperFirstLetter(application?.data?.organisation?.name),
        claimSummaryDetails: rowsWithData,
        contactPerson,
        status: { capitalisedtype: formatStatusId(claim.statusId), normalType: upperFirstLetter(formatStatusId(claim.statusId).toLowerCase()), tagClass: getStyleClassByStatus(formatStatusId(claim.statusId)) },
        applicationSummaryDetails,
        historyData,
        recommendData: Object.entries(getRecommendData(recommend)).length === 0 ? false : getRecommendData(recommend),
        recommendForm: displayRecommendationForm,
        authoriseOrRejectForm: {
          display: displayAuthoriseOrRejectForm,
          displayAuthorisePaymentButton
        },
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
