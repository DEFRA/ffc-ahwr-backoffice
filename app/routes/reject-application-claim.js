const Joi = require('joi')
const config = require('../config')
const { processApplicationClaim } = require('../api/applications')
const getUser = require('../auth/get-user')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')

module.exports = {
  method: 'POST',
  path: '/reject-application-claim',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: Joi.object(config.rbac.enabled
        ? {
            confirm: Joi.array().items(Joi.string().valid('rejectClaim', 'sentChecklist')).required(),
            reference: Joi.string().valid(),
            page: Joi.number().greater(0).default(1)
          }
        : {
            rejectClaim: Joi.string().valid('yes', 'no'),
            reference: Joi.string().valid(),
            page: Joi.number().greater(0).default(1)
          }),
      failAction: async (request, h, error) => {
        console.log(`routes:reject-application-claim: Error when validating payload: ${JSON.stringify({
          errorMessage: error.message,
          payload: request.payload
        })}`)
        const errors = []
        if (error.details && error.details[0].context.key === 'confirm') {
          errors.push({
            text: 'You must select both checkboxes',
            href: '#reject-claim-panel'
          })
        }
        return h
          .redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}&errors=${encodeURIComponent(JSON.stringify(errors))}`)
          .takeover()
      }
    },
    handler: async (request, h) => {
      if (config.rbac.enabled) {
        if (JSON.stringify(request.payload.confirm) === JSON.stringify(['rejectClaim', 'sentChecklist'])) {
          const userName = getUser(request).username
          await processApplicationClaim(request.payload.reference, userName, false)
          await crumbCache.generateNewCrumb(request, h)
        }
        return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
      } else {
        if (request.payload.rejectClaim === 'yes') {
          const userName = getUser(request).username
          await processApplicationClaim(request.payload.reference, userName, false)
          await crumbCache.generateNewCrumb(request, h)
        }
        return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
      }
    }
  }
}
