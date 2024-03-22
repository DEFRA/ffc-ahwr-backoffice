const Joi = require('joi')
const boom = require('@hapi/boom')
const { administrator, authoriser, processor, recommender, user } = require('../auth/permissions')
const { getClaim } = require('../api/claims')

module.exports = {
  method: 'GET',
  path: '/view-claim/{reference}',
  options: {
    auth: { scope: [administrator, authoriser, processor, recommender, user] },
    validate: {
      params: Joi.object({
        reference: Joi.string().valid()
      })
    },
    handler: async (request, h) => {
      const claim = await getClaim(request.params.reference)
      if (!claim) {
        throw boom.badRequest()
      }

      return h.view('view-claim', {
        claim
      })
    }
  }
}
