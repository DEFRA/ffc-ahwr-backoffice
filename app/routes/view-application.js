const Joi = require('joi')
const boom = require('@hapi/boom')
const { getApplication } = require('../api/applications')
const { administrator, processor, user } = require('../auth/permissions')
const getStyleClassByStatus = require('../constants/status')
const ViewModel = require('./models/view-application')

module.exports = {
  method: 'GET',
  path: '/view-application/{reference}',
  options: {
    auth: { scope: [administrator, processor, user] },
    validate: {
      params: Joi.object({
        reference: Joi.string().valid()
      })
    },
    handler: async (request, h) => {
      const application = await getApplication(request.params.reference)
      if (!application) {
        throw boom.badRequest()
      }

      const statusClass = getStyleClassByStatus(application.status.status)
      return h.view('view-application', {
        applicationId: application.reference,
        status: application.status.status,
        statusClass,
        organisationName: application?.data?.organisation?.name,
        vetVisit: application?.vetVisit,
        claimed: application?.claimed,
        payment: application?.payment,
        ... new ViewModel(application)
      })
    }
  }
}
