const { Buffer } = require('buffer')
const mapAuth = require('../auth/map-auth')
const crumbCache = require('./utils/crumb-cache')
const processStageActions = require('./utils/process-stage-actions')
const permissions = require('../auth/permissions')
const stages = require('../constants/application-stages')
const stageExecutionActions = require('../constants/application-stage-execution-actions')
const { failActionTwoCheckboxes } = require('../routes/utils/fail-action-two-checkboxes')
const recommendToPayOrRejectSchema = require('./validationSchemas/recommend-to-pay-or-reject-schema')

module.exports = {
  method: 'POST',
  path: '/recommend-to-reject',
  options: {
    validate: {
      payload: recommendToPayOrRejectSchema,
      failAction: async (request, h, err) => {
        request.logger.setBindings({ err })
        const errors = await failActionTwoCheckboxes(err, 'pnl-recommend-confirmation')

        if (request.payload.claimOrApplication === 'claim') {
          return h
            .redirect(`/view-claim/${request.payload.reference}?recommendToReject=true${request.payload?.returnPage && '&returnPage=' + request.payload?.returnPage}&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
            .takeover()
        } else {
          return h
            .redirect(`/view-agreement/${request.payload.reference}?page=${request?.payload?.page || 1}&recommendToReject=true&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
            .takeover()
        }
      }
    },
    handler: async (request, h) => {
      const userRole = mapAuth(request)
      request.logger.setBindings({ userRole })
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
        return h.redirect(`/view-claim/${request.payload.reference}${request.payload?.returnPage && '?returnPage=' + request.payload?.returnPage}`)
      } else {
        return h.redirect(`/view-agreement/${request.payload.reference}?page=${request.payload.page}`)
      }
    }
  }
}
