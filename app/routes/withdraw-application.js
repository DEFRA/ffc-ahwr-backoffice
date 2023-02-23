const Joi = require('joi')
const { withdrawApplication } = require('../api/applications')
const { administrator } = require('../auth/permissions')
const getUser = require('../auth/get-user')

module.exports = {
  method: 'POST',
  path: '/withdraw-application',
  options: {
    auth: { scope: [administrator] },
    validate: {
      payload: Joi.object({
        withdrawConfirmation: Joi.string().valid('yes', 'no'),
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1)
      })
    },
    handler: async (request, h) => {
      if (request.payload.withdrawConfirmation === 'yes') {
        const userName = getUser(request).username
        await withdrawApplication(request.payload.reference, userName, 2)
      }
      return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
    }
  }
}
