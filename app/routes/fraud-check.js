const Joi = require('joi')
const boom = require('@hapi/boom')
const { administrator, processor, user } = require('../auth/permissions')
const { submitApplicationFraudCheck } = require('../api/applications')

module.exports = [{
  method: 'POST',
  path: '/application/fraud-check/{reference}',
  options: {
    auth: { scope: [administrator, processor, user] },
    validate: {
      params: Joi.object({
        reference: Joi.string().valid()
      }),
      payload: Joi.object({
        [accepted]: Joi.string().valid('yes', 'no').required()
      }),
    },
    handler: async (request, h) => {
      const application = await submitApplicationFraudCheck(request.params.reference, request.payload.accepted)
      if (!application) {
        throw boom.badRequest()
      }
    }
  }
}]
