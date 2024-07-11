const { Buffer } = require('buffer')
const Boom = require('@hapi/boom')
const mapAuth = require('../auth/map-auth')
const crumbCache = require('./utils/crumb-cache')
const processStageActions = require('./utils/process-stage-actions')
const permissions = require('../auth/permissions')
const stages = require('../constants/application-stages')
const stageExecutionActions = require('../constants/application-stage-execution-actions')
const { failActionConsoleLog, failActionTwoCheckboxes } = require('../routes/utils/fail-action-two-checkboxes')
const recommendToPayOrRejectSchema = require('./validationSchemas/recommend-to-pay-or-reject-schema')

module.exports = {
  method: 'POST',
  path: '/recommend-to-reject',
  options: {
    validate: {
      payload: recommendToPayOrRejectSchema,
      failAction: async (request, h, error) => {
        failActionConsoleLog(request, error, 'recommend-to-reject')
        const errors = await failActionTwoCheckboxes(error, 'pnl-recommend-confirmation')

        if (request.payload.claimOrApplication === 'claim') {
          return h
            .redirect(`/view-claim/${request.payload.reference}?recommendToReject=true&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
            .takeover()
        } else {
          return h
            .redirect(`/view-agreement/${request.payload.reference}?page=${request?.payload?.page || 1}&recommendToReject=true&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
            .takeover()
        }
      }
    },
    handler: async (request, h) => {
      try {
        const userRole = mapAuth(request)
        if (!userRole.isRecommender && !userRole.isAdministrator) {
          throw new Error('User must be a recommender or an admin')
        }
        await processStageActions(
          request,
          permissions.recommender,
          stages.claimApproveReject,
          stageExecutionActions.recommendToReject,
          false
        )
        await crumbCache.generateNewCrumb(request, h)
        if (request.payload.claimOrApplication === 'claim') {
          return h.redirect(`/view-claim/${request.payload.reference}`)
        } else {
          return h.redirect(`/view-agreement/${request.payload.reference}?page=${request.payload.page}`)
        }
      } catch (error) {
        console.error(`routes:recommend-to-reject: Error when processing request: ${error.message}`)
        throw Boom.internal(error.message)
      }
    }
  }
}
