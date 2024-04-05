const Boom = require('@hapi/boom')
const Joi = require('joi')
const config = require('../config')
const { processApplicationClaim } = require('../api/applications')
const mapAuth = require('../auth/map-auth')
const getUser = require('../auth/get-user')
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
      payload: Joi.object(config.rbac.enabled
        ? {
          claimOrApplication: Joi.string().valid('claim', 'application').required(),
            confirm: Joi.array().items(
              Joi.string().valid('approveClaim').required(),
              Joi.string().valid('sentChecklist').required()
            ).required(),
            reference: Joi.string().valid().required(),
            page: Joi.number().greater(0).default(1).optional()
          }
        : {
          claimOrApplication: Joi.string().valid('claim', 'application').required(),
            approveClaim: Joi.string().valid('yes', 'no'),
            reference: Joi.string().valid(),
            page: Joi.number().greater(0).default(1).optional()
          }),
      failAction: async (request, h, error) => {
        failActionConsoleLog(request, error, 'approve-application-claim')
        const errors = await failActionTwoCheckboxes(error, 'authorise-payment-panel')
        return redirectWithError(h, request.payload.claimOrApplication, request.payload.reference, request?.payload?.page || 1, errors, 'failed validation for approve-application-claim')
      }
    },
    handler: async (request, h) => {
      if (config.rbac.enabled) {
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
          return redirectToViewApplication(h, request.payload.claimOrApplication, request.payload.reference, request?.payload?.page || 1)
        } catch (error) {
          console.error(`routes:approve-application-claim: Error when processing request: ${error.message}`)
          throw Boom.internal(error.message)
        }
      } else {
        if (request.payload.approveClaim === 'yes') {
          const userName = getUser(request).username
          await processApplicationClaim(request.payload.reference, userName, true)
          await crumbCache.generateNewCrumb(request, h)
        }
        return redirectToViewApplication(h, request.payload.claimOrApplication, request.payload.reference, request?.payload?.page || 1)
      }
    }
  }
}
