const { Buffer } = require('buffer')
const Boom = require('@hapi/boom')
const mapAuth = require('../auth/map-auth')
const crumbCache = require('./utils/crumb-cache')
const processStageActions = require('./utils/process-stage-actions')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const permissions = require('../auth/permissions')
const stages = require('../constants/application-stages')
const stageExecutionActions = require('../constants/application-stage-execution-actions')
const { failActionConsoleLog, failActionTwoCheckboxes } = require('../routes/utils/fail-action-two-checkboxes')
const recommendToPayOrRejectSchema = require('./validationSchemas/recommend-to-pay-or-reject-schema')

module.exports = {
  method: 'POST',
  path: '/recommend-to-pay',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: recommendToPayOrRejectSchema,
      failAction: async (request, h, error) => {
        failActionConsoleLog(request, error, 'recommend-to-pay')
        const errors = await failActionTwoCheckboxes(error, 'pnl-recommend-confirmation')

        if (request.payload.claimOrApplication === 'claim') {
          return h
            .redirect(`/view-claim/${request.payload.reference}?recommendToPay=true${request.payload?.returnPage && '&returnPage=' + request.payload?.returnPage}&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
            .takeover()
        } else {
          return h
            .redirect(`/view-agreement/${request.payload.reference}?page=${request?.payload?.page || 1}&recommendToPay=true&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
            .takeover()
        }
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

        if (request.payload.claimOrApplication === 'claim') {
          return h.redirect(`/view-claim/${request.payload.reference}${request.payload?.returnPage && '?returnPage=' + request.payload?.returnPage}`)
        } else {
          return h.redirect(`/view-agreement/${request.payload.reference}?page=${request.payload.page}`)
        }
      } catch (error) {
        console.error(`routes:recommend-to-pay: Error when processing request: ${error.message}`)
        throw Boom.internal(error.message)
      }
    }
  }
}
