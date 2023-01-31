const Joi = require('joi')
const { withdrawApplication } = require('../api/applications')

module.exports = {
  method: 'POST',
  path: '/withdraw-application',
  options: {
    validate: {
      payload: Joi.object({
        withdrawConfirmation: Joi.string().valid('yes', 'no'),
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1)
      })
    },
    handler: async (request, h) => {
      if (request.payload.withdrawConfirmation === 'yes') {
        await withdrawApplication(request.payload.reference, 'admin')
      }
      return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
    }
  }
}
