const Joi = require('joi')
const boom = require('@hapi/boom')
const { getApplication } = require('../api/applications')
const { administrator, processor, user } = require('../auth/permissions')
const getStyleClassByStatus = require('../constants/status')
const ViewModel = require('./models/view-application')
const { upperFirstLetter } = require('../lib/display-helper')

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
        withdraw: Joi.bool().default(false)
      })
    },
    handler: async (request, h) => {
      const application = await getApplication(request.params.reference)
      if (!application) {
        throw boom.badRequest()
      }

      const status = upperFirstLetter(application.status.status.toLowerCase())
      const statusClass = getStyleClassByStatus(application.status.status)
      const withdrawLinkStatus = ['IN CHECK', 'AGREED']
      const withdrawConfirmationForm = application.status.status !== 'WITHDRAWN' && withdrawLinkStatus.includes(application.status.status) && request.query.withdraw

      return h.view('view-application', {
        applicationId: application.reference,
        status,
        statusClass,
        organisationName: application?.data?.organisation?.name,
        vetVisit: application?.vetVisit,
        claimed: application?.claimed,
        withdrawLink: withdrawLinkStatus.includes(application.status.status),
        withdrawConfirmationForm,
        payment: application?.payment,
        ...new ViewModel(application),
        page: request.query.page
      })
    }
  }
}
