const Joi = require('joi')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')
const processStageActions = require('./utils/process-stage-actions')

module.exports = {
  method: 'POST',
  path: '/recommend-to-pay',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: Joi.object({
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1)
      })
    },
    handler: async (request, h) => {
      const role = 'Recommender'
      const stage = 'Claim Approve/Reject'
      await processStageActions(request, role, stage, 'Recommend to pay')
      await crumbCache.generateNewCrumb(request, h)
      return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
    }
  }
}
