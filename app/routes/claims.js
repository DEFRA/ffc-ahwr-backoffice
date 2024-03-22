const Joi = require('joi')
const boom = require('@hapi/boom')
const { administrator, authoriser, processor, recommender, user } = require('../auth/permissions')
const { getClaims } = require('../api/claims')

module.exports = {
  method: 'GET',
  path: '/claims/{reference}',
  options: {
    auth: { scope: [administrator, authoriser, processor, recommender, user] },
    validate: {
      params: Joi.object({
        reference: Joi.string().valid()
      })
    },
    handler: async (request, h) => {
      const claims = await getClaims(request.params.reference)
      if (!claims) {
        throw boom.badRequest()
      }

      return h.view('claims', {
        claims
      })
    }
  }
}
