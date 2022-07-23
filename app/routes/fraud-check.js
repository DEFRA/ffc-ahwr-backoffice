const Joi = require('joi')
const boom = require('@hapi/boom')
const { administrator, processor, user } = require('../auth/permissions')
const { submitApplicationFraudCheck } = require('../api/applications')
const session = require('../session')
const { viewApplication: { fraudCheck } } = require('../session/keys')

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
        fraudCheck: Joi.string().valid('yes', 'no').required()
      }),
    },
    handler: async (request, h) => {
      const application = await submitApplicationFraudCheck(request.params.reference, request.payload.fraudCheck)
      if (!application) {
        throw boom.badRequest()
      }
      session.setViewApplication(request, fraudCheck, request.payload.fraudCheck)
      return h.redirect(`/view-application/${request.params.reference}`)
    }
  }
}]
