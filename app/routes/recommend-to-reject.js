const Joi = require('joi')
const Boom = require('@hapi/boom')
const crumbCache = require('./utils/crumb-cache')
const processStageActions = require('./utils/process-stage-actions')
const permissions = require('../auth/permissions')
const stages = require('../constants/application-stages')
const stageExecutionActions = require('../constants/application-stage-execution-actions')

module.exports = {
  method: 'POST',
  path: '/recommend-to-reject',
  options: {
    validate: {
      payload: Joi.object({
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1),
        confirm: Joi.array().items(Joi.string().valid('checkedAgainstChecklist', 'sentChecklist')).required()
      }),
      failAction: async (request, h, error) => {
        console.log('Backoffice: recommend-to-reject: Error when validating payload: ', error)
        const errors = [
          {
            text: 'You must select both checkboxes',
            href: '#pnl-recommend-confirmation'
          }
        ]
        return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}&recommendToReject=true&errors=${encodeURIComponent(JSON.stringify(errors))}`).takeover()
      }
    },
    handler: async (request, h) => {
      const response = await processStageActions(request, permissions.recommender, stages.claimApproveReject, stageExecutionActions.recommendToReject, false)
      await crumbCache.generateNewCrumb(request, h)
      if (response.length === 0) {
        throw Boom.internal('Error when processing stage actions')
      }
      console.log('Backoffice: recommend-to-reject: Stage execution entry added: ', response)
      return h.redirect(`/view-application/${request.payload.reference}?page=${request.payload.page}`)
    }
  }
}
