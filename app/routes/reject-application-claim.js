const Joi = require('joi')
const { processApplicationClaim } = require('../api/applications')

module.exports = {
  method: 'POST',
  path: '/reject-application-claim',
  options: {
    validate: {
      payload: Joi.object({
        rejectClaim: Joi.string().valid('yes', 'no'),
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1)
      })
    },
    handler: async (request, h) => {
      if (request.payload.rejectClaim === 'yes') {
        await processApplicationClaim(request.payload.reference, 'admin', false)
      }
      return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
    }
  }
}
