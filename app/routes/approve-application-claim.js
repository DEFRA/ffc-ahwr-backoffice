const Boom = require('@hapi/boom')
const Joi = require('joi')
const mapAuth = require('../auth/map-auth')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')
const processStageActions = require('./utils/process-stage-actions')
const permissions = require('../auth/permissions')
const stages = require('../constants/application-stages')
const stageExecutionActions = require('../constants/application-stage-execution-actions')
const { failActionConsoleLog, failActionTwoCheckboxes } = require('../routes/utils/fail-action-two-checkboxes')
const { redirectWithError, redirectToViewApplication } = require('../routes/helpers')

module.exports = {
  method: 'POST',
  path: '/approve-application-claim',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: Joi.object({
        confirm: Joi.array().items(
          Joi.string().valid('approveClaim').required(),
          Joi.string().valid('sentChecklist').required()
        ).required(),
        reference: Joi.string().valid().required(),
        page: Joi.number().greater(0).default(1)
      }),
      failAction: async (request, h, error) => {
        failActionConsoleLog(request, error, 'approve-application-claim')
        const errors = await failActionTwoCheckboxes(error, 'authorise-payment-panel')
        return redirectWithError(h, request.payload.reference, request?.payload?.page || 1, errors, 'failed validation for approve-application-claim')
      }
    },
    handler: async (request, h) => {
      try {
        const userRole = mapAuth(request)
        if (!userRole.isAuthoriser && !userRole.isAdministrator) {
          throw Boom.internal('routes:approve-application-claim: User must be an authoriser or an admin')
        }
        console.log(`processStageActions( ${request}, ${permissions.authoriser}, ${stages.claimApproveReject}, ${stageExecutionActions.authorisePayment}, ${true})`)
        await processStageActions(
          request,
          permissions.authoriser,
          stages.claimApproveReject,
          stageExecutionActions.authorisePayment,
          true
        )
        await crumbCache.generateNewCrumb(request, h)
        return redirectToViewApplication(h, request.payload.reference, request?.payload?.page || 1)
      } catch (error) {
        console.error(`routes:approve-application-claim: Error when processing request: ${error.message}`)
        throw Boom.internal(error.message)
      }
    }
  }
}
