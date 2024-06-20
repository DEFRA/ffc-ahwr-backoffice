const { Buffer } = require('buffer')
const Joi = require('joi')
const boom = require('@hapi/boom')
const { endemics } = require('../config')
const { getApplication, getApplicationHistory, getApplicationEvents } = require('../api/applications')
const { administrator, processor, user, recommender, authoriser } = require('../auth/permissions')
const { getStyleClassByStatus } = require('../constants/status')
const ViewModel = require('./models/view-application')
const { upperFirstLetter } = require('../lib/display-helper')
const mapAuth = require('../auth/map-auth')
const claimFormHelper = require('./utils/claim-form-helper')
const applicationStatus = require('../constants/application-status')
const checkboxErrors = require('./utils/checkbox-errors')
const { getContactHistory, displayContactHistory } = require('../api/contact-history')

module.exports = {
  method: 'GET',
  path: '/view-application/{reference}',
  options: {
    auth: { scope: [administrator, processor, user, recommender, authoriser] },
    validate: {
      params: Joi.object({
        reference: Joi.string().valid()
      }),
      query: Joi.object({
        page: Joi.number().greater(0).default(1),
        errors: Joi.string().allow(null),
        withdraw: Joi.bool().default(false),
        approve: Joi.bool().default(false),
        reject: Joi.bool().default(false),
        recommendToPay: Joi.bool().default(false),
        recommendToReject: Joi.bool().default(false),
        moveToInCheck: Joi.bool().default(false)
      })
    },
    handler: async (request, h) => {
      const application = await getApplication(request.params.reference)
      if (!application) {
        throw boom.badRequest()
      }
      const applicationHistory = await getApplicationHistory(request.params.reference)

      let applicationEvents
      if ((application?.claimed ||
        application?.statusId === applicationStatus.inCheck ||
        application?.statusId === applicationStatus.readyToPay ||
        application?.statusId === applicationStatus.rejected) &&
        !application?.data?.dateOfClaim) {
        applicationEvents = await getApplicationEvents(application?.data?.organisation.sbi)
      }

      const status = upperFirstLetter(application.status.status.toLowerCase())
      const statusClass = getStyleClassByStatus(application.status.status)
      const mappedAuth = mapAuth(request)
      const withdrawLinkStatus = ['AGREED']
      const isAgreementAgreedAndUserIsAdminAuthoriserRecommender = withdrawLinkStatus.includes(application.status.status) && (mappedAuth.isAdministrator || mappedAuth.isAuthoriser)
      const withdrawLink = isAgreementAgreedAndUserIsAdminAuthoriserRecommender && !request.query.withdraw
      const withdrawConfirmationForm = isAgreementAgreedAndUserIsAdminAuthoriserRecommender && application.status.status !== 'WITHDRAWN' && request.query.withdraw

      const {
        displayRecommendationForm,
        displayRecommendToPayConfirmationForm,
        displayRecommendToRejectConfirmationForm,
        displayAuthoriseToPayConfirmationForm,
        displayAuthoriseToRejectConfirmationForm,
        subStatus,
        displayMoveToInCheckFromHold,
        displayOnHoldConfirmationForm
      } = await claimFormHelper(request, request.params.reference, application.statusId)

      const errors = request.query.errors
        ? JSON.parse(Buffer.from(request.query.errors, 'base64').toString('utf8'))
        : []

      const recommend = {
        displayRecommendToPayConfirmationForm,
        displayRecommendToRejectConfirmationForm,
        errorMessage: checkboxErrors(errors, 'pnl-recommend-confirmation')
      }
      const contactHistory = await getContactHistory(request.params.reference)
      const contactHistoryDetails = displayContactHistory(contactHistory)
      const organisation = application.data?.organisation
      const listData = [
        { field: 'Name', newValue: organisation?.farmerName, oldValue: contactHistoryDetails.farmerName },
        { field: 'SBI number', newValue: organisation?.sbi, oldValue: null },
        { field: 'Address', newValue: organisation?.address, oldValue: contactHistoryDetails.address },
        { field: 'Email address', newValue: organisation?.email, oldValue: contactHistoryDetails.email },
        { field: 'Organisation email address', newValue: organisation?.orgEmail, oldValue: contactHistoryDetails.orgEmail }
      ]
      const viewModel = new ViewModel(application, applicationHistory, recommend, applicationEvents)
      viewModel.model.listData = listData
      return h.view('view-application', {
        endemics: endemics.enabled,
        reference: application.reference,
        status,
        statusClass,
        organisationName: application?.data?.organisation?.name,
        vetVisit: application?.vetVisit,
        claimed: application?.claimed,
        withdrawLink,
        withdrawConfirmationForm,
        payment: application?.payment,
        ...viewModel,
        page: request.query.page,
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
        subStatus,
        errors
      })
    }
  }
}
