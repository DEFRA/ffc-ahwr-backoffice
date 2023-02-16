const Joi = require('joi')
const boom = require('@hapi/boom')
const { getApplication } = require('../api/applications')
const { administrator, processor, user } = require('../auth/permissions')
const getStyleClassByStatus = require('../constants/status')
const ViewModel = require('./models/view-application')
const { upperFirstLetter } = require('../lib/display-helper')
const mapAuth = require('../auth/map-auth')

module.exports = {
  method: 'GET',
  path: '/view-application/{reference}',
  options: {
    auth: { scope: [administrator, processor, user] },
    validate: {
      params: Joi.object({
        reference: Joi.string().valid()
      }),
      query: Joi.object({
        page: Joi.number().greater(0).default(1),
        withdraw: Joi.bool().default(false),
        approve: Joi.bool().default(false),
        reject: Joi.bool().default(false)
      })
    },
    handler: async (request, h) => {
      const application = await getApplication(request.params.reference)
      if (!application) {
        throw boom.badRequest()
      }

      const status = upperFirstLetter(application.status.status.toLowerCase())
      const statusClass = getStyleClassByStatus(application.status.status)
      const mappedAuth = mapAuth(request)
      const withdrawLinkStatus = ['AGREED']
      const withdrawLink = withdrawLinkStatus.includes(application.status.status) && mappedAuth.isAdministrator
      const withdrawConfirmationForm = application.status.status !== 'WITHDRAWN' && withdrawLink && request.query.withdraw

      const isApplicationInCheckAndUserIsAdmin = application.status.status === 'IN CHECK' && mappedAuth.isAdministrator
      const claimConfirmationForm = isApplicationInCheckAndUserIsAdmin && !request.query.approve && !request.query.reject
      const approveClaimConfirmationForm = isApplicationInCheckAndUserIsAdmin && request.query.approve
      const rejectClaimConfirmationForm = isApplicationInCheckAndUserIsAdmin && request.query.reject

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
        ...new ViewModel(application),
        page: request.query.page
      })
    }
  }
}
