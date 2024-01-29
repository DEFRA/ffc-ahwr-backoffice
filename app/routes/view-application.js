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
const rbacEnabled = require('../config').rbac.enabled
const applicationStatus = require('../constants/application-status')

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
        moveToInCheck: Joi.bool().default(false),
        rejectOnHoldClaim: Joi.bool().default(false)
      })
    },
    handler: async (request, h) => {
      const application = await getApplication(request.params.reference)
      if (!application) {
        throw boom.badRequest()
      }
      const applicationHistory = await getApplicationHistory(request.params.reference)

      // const claimDataStatus = ['IN CHECK', 'REJECTED', 'READY TO PAY']
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
      const claimConfirmationForm = !rbacEnabled && isApplicationInCheckAndUserIsAdmin && !request.query.approve && !request.query.reject
      const approveClaimConfirmationForm = !rbacEnabled && isApplicationInCheckAndUserIsAdmin && request.query.approve
      const rejectClaimConfirmationForm = !rbacEnabled && isApplicationInCheckAndUserIsAdmin && request.query.reject

      const {
        displayRecommendationForm,
        displayRecommendToPayConfirmationForm,
        displayRecommendToRejectConfirmationForm,
        displayAuthorisationForm,
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
        errorMessage: errors.map(e => e.href).includes('#pnl-recommend-confirmation')
          ? { text: 'Select both checkboxes' }
          : undefined
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
        authoriseOrRejectForm: {
          display: displayAuthorisationForm,
          displayAuthorisePaymentButton: subStatus === 'Recommended to pay'
        },
        authorisePaymentConfirmForm: {
          display: displayAuthoriseToPayConfirmationForm,
          errorMessage: errors.map(e => e.href).includes('#authorise-payment-panel')
            ? { text: 'Select both checkboxes' }
            : undefined
        },
        rejectClaimConfirmForm: {
          display: displayAuthoriseToRejectConfirmationForm,
          errorMessage: errors.map(e => e.href).includes('#reject-claim-panel')
            ? { text: 'Select both checkboxes' }
            : undefined
        },
        onHoldConfirmationForm: {
          display: displayOnHoldConfirmationForm,
          errorMessage: errors.map(e => e.href).includes('#onhold-claim-panel')
            ? { text: 'Select both checkboxes' }
            : undefined
        },
        displayMoveToInCheckFromHold,
        subStatus,
        errors
      })
    }
  }
}
