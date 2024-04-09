const { Buffer } = require('buffer')
const Boom = require('@hapi/boom')
const config = require('../config')
const { updateApplicationStatus } = require('../api/applications')
const { updateClaimStatus } = require('../api/claims')
const mapAuth = require('../auth/map-auth')
const getUser = require('../auth/get-user')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')
const applicationStatus = require('../constants/application-status')
const { failActionConsoleLog, failActionTwoCheckboxes } = require('../routes/utils/fail-action-two-checkboxes')
const { onHoldToInCheckSchema, onHoldToInCheckRbacDisabledSchema } = require('./validationSchemas/on-hold-to-in-check-schema')

const processRejectOnHoldClaim = async (request, applicationStatus, h) => {
  if (request.payload.rejectOnHoldClaim === 'yes') {
    const userName = getUser(request).username
    const result = request.payload.claimOrApplication === 'application' ? 
            await updateApplicationStatus(request.payload.reference, userName, applicationStatus.inCheck) :
            await updateClaimStatus(request.payload.reference, userName, applicationStatus.inCheck)
    console.log(`${request.payload.claimOrApplication} ${request.payload.reference}, moved to IN CHECK Status from ON HOLD => ${result}`)
    await crumbCache.generateNewCrumb(request, h)
  }
}

module.exports = {
  method: 'POST',
  path: '/reject-on-hold-claim',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: config.rbac.enabled ? onHoldToInCheckSchema : onHoldToInCheckRbacDisabledSchema,
      failAction: async (request, h, error) => {
        failActionConsoleLog(request, error, 'reject-on-hold-claim')
        const errors = await failActionTwoCheckboxes(error, 'confirm-move-to-in-check-panel')
        if (request.payload.claimOrApplication === 'claim') {
          return h
            .redirect(`/view-claim/${request.payload.reference}?moveToInCheck=true&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
            .takeover()
        } else {
          return h
            .redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}&moveToInCheck=true&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
            .takeover()
        }
      }
    },
    handler: async (request, h) => {
      if (config.rbac.enabled) {
        try {
          const userRole = mapAuth(request)
          if (!userRole.isAuthoriser && !userRole.isRecommender && !userRole.isAdministrator) {
            throw Boom.unauthorized('routes:reject-on-hold-claim: User must be an authoriser/recommender or an admin')
          }
          await processRejectOnHoldClaim(request, applicationStatus, h)
          if (request.payload.claimOrApplication === 'claim') {
            return h.redirect(`/view-claim/${request.payload.reference}`)
          } else {
            return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
          }
        } catch (error) {
          console.error(`routes:reject-on-hold-claim: Error when processing request: ${error.message}`)
          throw Boom.internal(error.message)
        }
      } else {
        await processRejectOnHoldClaim(request, applicationStatus, h)
        if (request.payload.claimOrApplication === 'claim') {
          return h.redirect(`/view-claim/${request.payload.reference}`)
        } else {
          return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
        }
      }
    }
  }
}
