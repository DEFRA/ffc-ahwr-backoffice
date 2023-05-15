const Joi = require('joi')
const boom = require('@hapi/boom')
const { getApplication, getApplicationHistory } = require('../api/applications')
const { administrator, processor, user, recommender, authoriser } = require('../auth/permissions')
const getStyleClassByStatus = require('../constants/status')
const ViewModel = require('./models/view-application')
const { upperFirstLetter } = require('../lib/display-helper')
const mapAuth = require('../auth/map-auth')
const claimHelper = require('./utils/claim-form-helper')

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
        withdraw: Joi.bool().default(false),
        approve: Joi.bool().default(false),
        reject: Joi.bool().default(false),
        recommendToPay: Joi.bool().default(false)
      })
    },
    handler: async (request, h) => {
      const application = await getApplication(request.params.reference)
      if (!application) {
        throw boom.badRequest()
      }
      const applicationHistory = await getApplicationHistory(request.params.reference)

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

      const { displayRecommendationForm, displayRecommendToPayConfirmationForm } = await claimHelper(request, request.params.reference, application.status.status)

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
        ...new ViewModel(application, applicationHistory),
        page: request.query.page,
        recommendForm: displayRecommendationForm,
        recommendToPay: displayRecommendToPayConfirmationForm
      })
    }
  }
}
