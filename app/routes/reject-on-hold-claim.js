const { Buffer } = require('buffer')
const Boom = require('@hapi/boom')
const { updateApplicationStatus } = require('../api/applications')
const { updateClaimStatus } = require('../api/claims')
const mapAuth = require('../auth/map-auth')
const getUser = require('../auth/get-user')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')
const applicationStatus = require('../constants/application-status')
const { failActionTwoCheckboxes } = require('../routes/utils/fail-action-two-checkboxes')
const { onHoldToInCheckSchema } = require('./validationSchemas/on-hold-to-in-check-schema')

const processRejectOnHoldClaim = async (request, applicationStatus, h) => {
  if (request.payload.rejectOnHoldClaim === 'yes') {
    const userName = getUser(request).username
    request.payload.claimOrApplication === 'application'
      ? await updateApplicationStatus(request.payload.reference, userName, applicationStatus.inCheck, request.logger)
      : await updateClaimStatus(request.payload.reference, userName, applicationStatus.inCheck, request.logger)
    await crumbCache.generateNewCrumb(request, h)
  }
}

module.exports = {
  method: 'POST',
  path: '/reject-on-hold-claim',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: onHoldToInCheckSchema,
      failAction: async (request, h, err) => {
        request.logger.setBindings({ err })
        const errors = await failActionTwoCheckboxes(err, 'confirm-move-to-in-check-panel')
        if (request.payload.claimOrApplication === 'claim') {
          return h
            .redirect(`/view-claim/${request.payload.reference}?moveToInCheck=true${request.payload?.returnPage && '&returnPage=' + request.payload?.returnPage}&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
            .takeover()
        } else {
          return h
            .redirect(`/view-agreement/${request.payload.reference}?page=${request?.payload?.page || 1}&moveToInCheck=true&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
            .takeover()
        }
      }
    },
    handler: async (request, h) => {
      const { claimOrApplication, reference, rejectOnHoldClaim } = request.payload
      request.logger.setBindings({
        claimOrApplication,
        reference,
        rejectOnHoldClaim
      })

      const userRole = mapAuth(request)
      request.logger.setBindings({ userRole })
      if (!userRole.isAuthoriser && !userRole.isRecommender && !userRole.isAdministrator) {
        throw Boom.unauthorized('routes:reject-on-hold-claim: User must be an authoriser/recommender or an admin')
      }
      await processRejectOnHoldClaim(request, applicationStatus, h)

      if (claimOrApplication === 'claim') {
        return h.redirect(`/view-claim/${reference}${request.payload?.returnPage && '?returnPage=' + request.payload?.returnPage}`)
      } else {
        return h.redirect(`/view-agreement/${reference}?page=${request?.payload?.page || 1}`)
      }
    }
  }
}
