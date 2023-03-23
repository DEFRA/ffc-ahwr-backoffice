const Joi = require('joi')
const { processApplicationClaim } = require('../api/applications')
const getUser = require('../auth/get-user')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')

module.exports = {
  method: 'POST',
  path: '/reject-application-claim',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: Joi.object({
        rejectClaim: Joi.string().valid('yes', 'no'),
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1)
      })
    },
    handler: async (request, h) => {
      if (request.payload.rejectClaim === 'yes') {
        const userName = getUser(request).username
        await processApplicationClaim(request.payload.reference, userName, false)
      }
      return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
    }
  }
}
