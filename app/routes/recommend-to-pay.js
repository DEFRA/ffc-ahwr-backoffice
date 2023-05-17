const Joi = require('joi')
const Boom = require('@hapi/boom')
const crumbCache = require('./utils/crumb-cache')
const processStageActions = require('./utils/process-stage-actions')
const permissions = require('../auth/permissions')
const stages = require('../constants/application-stages')
const stageExecutionActions = require('../constants/application-stage-execution-actions')

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
      const response = await processStageActions(request, permissions.recommender, stages.claimApproveReject, stageExecutionActions.recommendToPay, false)
      await crumbCache.generateNewCrumb(request, h)
      if (response.length === 0) {
        throw Boom.internal('Error when processing stage actions')
      }
      console.log('Backoffice: recommend-to-pay: Stage execution entry added: ', response)
      return h.redirect(`/view-application/${request.payload.reference}?page=${request.payload.page}`)
    }
  }
}
