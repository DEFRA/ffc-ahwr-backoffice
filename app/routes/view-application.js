const { Buffer } = require('buffer')
const Joi = require('joi')
const boom = require('@hapi/boom')
const { getApplication, getApplicationHistory, getApplicationEvents } = require('../api/applications')
const { administrator, processor, user, recommender, authoriser } = require('../auth/permissions')
const getStyleClassByStatus = require('../constants/status')
const ViewModel = require('./models/view-application')
const { upperFirstLetter } = require('../lib/display-helper')
const mapAuth = require('../auth/map-auth')
const claimHelper = require('./utils/claim-form-helper')
const applicationStatus = require('../constants/application-status')
const checkboxErrors = require('./utils/checkbox-errors')

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
      const isAgreementAgreedAndUserIsAdmin = withdrawLinkStatus.includes(application.status.status) && mappedAuth.isAdministrator
      const withdrawLink = isAgreementAgreedAndUserIsAdmin && !request.query.withdraw
      const withdrawConfirmationForm = isAgreementAgreedAndUserIsAdmin && application.status.status !== 'WITHDRAWN' && request.query.withdraw

      const isApplicationInCheckAndUserIsAdmin = application.status.status === 'IN CHECK' && mappedAuth.isAdministrator
      const claimConfirmationForm = isApplicationInCheckAndUserIsAdmin && !request.query.approve && !request.query.reject
      const approveClaimConfirmationForm = isApplicationInCheckAndUserIsAdmin && request.query.approve
      const rejectClaimConfirmationForm = isApplicationInCheckAndUserIsAdmin && request.query.reject

      const {
        displayRecommendationForm,
        displayRecommendToPayConfirmationForm,
        displayRecommendToRejectConfirmationForm,
        displayAuthoriseToPayConfirmationForm,
        displayAuthoriseToRejectConfirmationForm,
        subStatus,
        displayMoveToInCheckFromHold,
        displayOnHoldConfirmationForm
      } = await claimHelper(request, request.params.reference, application.status.status)

      const errors = request.query.errors
        ? JSON.parse(Buffer.from(request.query.errors, 'base64').toString('utf8'))
        : []

      const recommend = {
        displayRecommendToPayConfirmationForm,
        displayRecommendToRejectConfirmationForm,
        errorMessage: checkboxErrors(errors, 'pnl-recommend-confirmation')
      }

      return h.view('view-application', {
        applicationId: application.reference,
        status,
        statusClass,
        organisationName: application?.data?.organisation?.name,
        vetVisit: application?.vetVisit,
        claimed: application?.claimed,
        withdrawLink,
        withdrawConfirmationForm,
        claimConfirmationForm,
        approveClaimConfirmationForm,
        rejectClaimConfirmationForm,
        payment: application?.payment,
        ...new ViewModel(application, applicationHistory, recommend, applicationEvents),
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
