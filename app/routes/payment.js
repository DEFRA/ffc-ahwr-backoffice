const Joi = require('joi')
const boom = require('@hapi/boom')
const { administrator, processor, user } = require('../auth/permissions')
const { submitApplicationPayment } = require('../api/applications')

module.exports = [{
  method: 'POST',
  path: '/application/payment/{reference}',
  options: {
    auth: { scope: [administrator, processor, user] },
    validate: {
      params: Joi.object({
        reference: Joi.string().valid()
      }),
      payload: Joi.object({
        [paid]: Joi.string().valid('yes', 'no').required()
      }),
    },
    handler: async (request, h) => {
      const application = await submitApplicationPayment(request.params.reference, request.payload.paid)
      if (!application) {
        throw boom.badRequest()
      }
    }
  }
}]
