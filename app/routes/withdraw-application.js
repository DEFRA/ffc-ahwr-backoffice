const Joi = require('joi')

module.exports = {
  method: 'POST',
  path: '/withdraw-application/{reference}',
  options: {
    validate:  {
      params: Joi.object({
        reference: Joi.string().valid()
      }),
      query: Joi.object({
        page: Joi.number().greater(0).default(1),
      }),
      payload: Joi.object({
        withdrawConfirmation: Joi.string().valid('yes', 'no'),
      })
    },
    handler: async (request, h) => {
      console.log(request.payload.withdrawConfirmation)
      return h.redirect(`/view-application/${request.params.reference}?page=${request?.query?.page || 1}`)
    }
  }
}