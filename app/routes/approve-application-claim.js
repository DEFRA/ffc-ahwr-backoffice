const Joi = require('joi')
const { processApplicationClaim } = require('../api/applications')
const getUser = require('../auth/get-user')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')

module.exports = {
  method: 'POST',
  path: '/approve-application-claim',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: Joi.object({
        confirm: Joi.array().items(Joi.string().valid('approveClaim', 'sentChecklist')).required(),
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1)
      }),
      failAction: async (request, h, error) => {
        console.log(`approve-application-claim: Error when validating payload: ${error.message}`)
        const errors = [
          {
            text: 'You must select both checkboxes',
            href: '#authorise-payment-panel'
          }
        ]
        return h
          .redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}&errors=${encodeURIComponent(JSON.stringify(errors))}`)
          .takeover()
      }
    },
    handler: async (request, h) => {
      if (request.payload.approveClaim === 'yes') {
        const userName = getUser(request).username
        await processApplicationClaim(request.payload.reference, userName, true)
        await crumbCache.generateNewCrumb(request, h)
      }
      return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
    }
  }
}
