const Joi = require('joi')
const Boom = require('@hapi/boom')
const mapAuth = require('../auth/map-auth')
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
        console.log(`routes:recommend-to-pay: Error when validating payload: ${JSON.stringify({
          errorMessage: error.message,
          payload: request.payload
        })}`)
        const errors = []
        if (error.details && error.details[0].context.key === 'confirm') {
          errors.push({
            text: 'You must select both checkboxes',
            href: '#pnl-recommend-confirmation'
          })
        }
        return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}&recommendToPay=true&errors=${encodeURIComponent(JSON.stringify(errors))}`).takeover()
      }
    },
    handler: async (request, h) => {
      const mappedAuth = mapAuth(request)
      if (!mappedAuth.isRecommender && !mappedAuth.isAdministrator) {
        throw Boom.internal('routes:recommend-to-pay: User must be a recommender or an admin')
      }
      if (JSON.stringify(request.payload.confirm) !== JSON.stringify(['checkedAgainstChecklist', 'sentChecklist'])) {
        throw Boom.internal('routes:recommend-to-pay: Error when validating payload', request.payload.confirm)
      }
      await crumbCache.generateNewCrumb(request, h)
      const response = await processStageActions(
        request,
        mappedAuth.isRecommender ? permissions.recommender : permissions.administrator,
        stages.claimApproveReject,
        stageExecutionActions.recommendToPay,
        false
      )
      if (response.length === 0) {
        throw Boom.internal('routes:recommend-to-pay: Error when processing stage actions')
      }
      return h.redirect(`/view-application/${request.payload.reference}?page=${request.payload.page}`)
    }
  }
}
