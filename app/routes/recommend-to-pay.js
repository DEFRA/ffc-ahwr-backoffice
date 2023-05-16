const Joi = require('joi')
const crumbCache = require('./utils/crumb-cache')
const processStageActions = require('./utils/process-stage-actions')

module.exports = {
  method: 'POST',
  path: '/recommend-to-pay',
  options: {
    validate: {
      payload: Joi.object({
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1),
        confirm: Joi.array().items(Joi.string().valid('checkedAgainstChecklist', 'sentChecklist')).required()
      }),
      failAction: async (request, h, error) => {
        console.log('Backoffice: recommend-to-pay: Error when validating payload: ', error)
        return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}&recommendToPay=true&error=true`).takeover()
      }
    },
    handler: async (request, h) => {
      const response = await processStageActions(request, 'Recommender', 'Claim Approve/Reject', 'Recommend to pay', false)
      await crumbCache.generateNewCrumb(request, h)
      console.log('Backoffice: recommend-to-pay: Stage execution entry added: ', response)
      return h.redirect(`/view-application/${request.payload.reference}?page=${request.payload.page}`)
    }
  }
}
