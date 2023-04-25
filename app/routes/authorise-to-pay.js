const Joi = require('joi')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')
const processStageActions = require('./utils/process-stage-actions')

module.exports = {
  method: 'POST',
  path: '/authorise-to-pay',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: Joi.object({
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1)
      })
    },
    handler: async (request, h) => {
      const role = 'Authoriser'
      const stage = 'Claim Approve/Reject'
      await processStageActions(request, role, stage, 'Paid', true)
      await crumbCache.generateNewCrumb(request, h)
      return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
    }
  }
}
