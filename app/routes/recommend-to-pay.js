const { Buffer } = require('buffer')
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
        confirm: Joi.array().items(
          Joi.string().valid('checkedAgainstChecklist').required(),
          Joi.string().valid('sentChecklist').required()
        ).required(),
        reference: Joi.string().valid().required(),
        page: Joi.number().greater(0).default(1)
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
        return h
          .redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}&recommendToPay=true&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
          .takeover()
      }
    },
    handler: async (request, h) => {
      try {
        const userRole = mapAuth(request)
        if (!userRole.isRecommender && !userRole.isAdministrator) {
          throw Boom.internal('User must be a recommender or an admin')
        }
        await processStageActions(
          request,
          permissions.recommender,
          stages.claimApproveReject,
          stageExecutionActions.recommendToPay,
          false
        )
        await crumbCache.generateNewCrumb(request, h)
        return h.redirect(`/view-application/${request.payload.reference}?page=${request.payload.page}`)
      } catch (error) {
        console.error(`routes:recommend-to-pay: Error when processing request: ${error.message}`)
        throw Boom.internal(error.message)
      }
    }
  }
}
