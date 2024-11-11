const Boom = require('@hapi/boom')
const mapAuth = require('../auth/map-auth')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')
const processStageActions = require('./utils/process-stage-actions')
const permissions = require('../auth/permissions')
const stages = require('../constants/application-stages')
const stageExecutionActions = require('../constants/application-stage-execution-actions')
const { failActionTwoCheckboxes } = require('../routes/utils/fail-action-two-checkboxes')
const { redirectWithError, redirectToViewApplication } = require('../routes/helpers')
const { approveClaim } = require('./validationSchemas/approve-or-reject-claim-schema')

module.exports = {
  method: 'POST',
  path: '/approve-application-claim',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: approveClaim,
      failAction: async (request, h, err) => {
        request.logger.setBindings({ err })
        const errors = await failActionTwoCheckboxes(err, 'authorise-payment-panel')
        return redirectWithError(h, request.payload.claimOrApplication, request.payload.reference, request?.payload?.page || 1, request.payload?.returnPage, errors)
      }
    },
    handler: async (request, h) => {
      const userRole = mapAuth(request)
      request.logger.setBindings({ userRole })

      if (!userRole.isAuthoriser && !userRole.isAdministrator) {
        throw Boom.internal('routes:approve-application-claim: User must be an authoriser or an admin')
      }

      await processStageActions(
        request,
        permissions.authoriser,
        stages.claimApproveReject,
        stageExecutionActions.authorisePayment,
        true
      )
      await crumbCache.generateNewCrumb(request, h)
      return redirectToViewApplication(h, request.payload.claimOrApplication, request.payload.reference, request?.payload?.page, request.payload?.returnPage)
    }
  }
}
