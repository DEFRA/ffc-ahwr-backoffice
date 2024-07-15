const Boom = require('@hapi/boom')
const mapAuth = require('../auth/map-auth')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')
const processStageActions = require('./utils/process-stage-actions')
const permissions = require('../auth/permissions')
const stages = require('../constants/application-stages')
const stageExecutionActions = require('../constants/application-stage-execution-actions')
const { failActionConsoleLog, failActionTwoCheckboxes } = require('../routes/utils/fail-action-two-checkboxes')
const { redirectRejectWithError, redirectToViewApplication } = require('../routes/helpers')
const { rejectClaim } = require('./validationSchemas/approve-or-reject-claim-schema')

module.exports = {
  method: 'POST',
  path: '/reject-application-claim',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: rejectClaim,
      failAction: async (request, h, error) => {
        failActionConsoleLog(request, error, 'reject-application-claim')
        const errors = await failActionTwoCheckboxes(error, 'reject-claim-panel')
        return redirectRejectWithError(h, request.payload.claimOrApplication, request.payload.reference, request?.payload?.page || 1, request.payload?.returnPage, errors, 'failed validation for approve-application-claim')
      }
    },
    handler: async (request, h) => {
      try {
        const userRole = mapAuth(request)
        if (!userRole.isAuthoriser && !userRole.isAdministrator) {
          throw Boom.unauthorized('routes:reject-application-claim: User must be an authoriser or an admin')
        }
        await processStageActions(
          request,
          permissions.authoriser,
          stages.claimApproveReject,
          stageExecutionActions.authoriseRejection,
          false
        )
        await crumbCache.generateNewCrumb(request, h)
        return redirectToViewApplication(h, request.payload.claimOrApplication, request.payload.reference, request?.payload?.page, request.payload?.returnPage)
      } catch (error) {
        console.error(`routes:reject-application-claim: Error when processing request: ${error.message}`)
        throw Boom.internal(error.message)
      }
    }
  }
}
