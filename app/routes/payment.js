const Joi = require('joi')
const boom = require('@hapi/boom')
const { administrator, processor, user } = require('../auth/permissions')
const { submitApplicationPayment } = require('../api/applications')
const session = require('../session')
const { viewApplication: { payment } } = require('../session/keys')

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
        payment: Joi.string().valid('yes', 'no').required()
      })
    },
    handler: async (request, h) => {
      const application = await submitApplicationPayment(request.params.reference, request.payload.payment)
      if (!application) {
        throw boom.badRequest()
      }
      session.setApplicationPayment(request, payment + request.params.reference, request.payload.payment)
      return h.redirect(`/view-application/${request.params.reference}`)
    }
  }
}]
