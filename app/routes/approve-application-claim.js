const Joi = require('joi')
const { processApplicationClaim } = require('../api/applications')

module.exports = {
  method: 'POST',
  path: '/approve-application-claim',
  options: {
    validate: {
      payload: Joi.object({
        approveClaim: Joi.string().valid('yes', 'no'),
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1)
      })
    },
    handler: async (request, h) => {
      if (request.payload.approveClaim === 'yes') {
        await processApplicationClaim(request.payload.reference, 'admin', true)
      }
      return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
    }
  }
}
