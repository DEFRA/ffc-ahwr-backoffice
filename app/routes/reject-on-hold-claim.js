const { Buffer } = require('buffer')
const Boom = require('@hapi/boom')
const Joi = require('joi')
const config = require('../config')
const { updateApplicationStatus } = require('../api/applications')
const mapAuth = require('../auth/map-auth')
const getUser = require('../auth/get-user')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')
const applicationStatus = require('../constants/application-status')

const processRejectOnHoldClaim = async (request, applicationStatus, h) => {
  if (request.payload.rejectOnHoldClaim === 'yes') {
    const userName = getUser(request).username
    const result = await updateApplicationStatus(request.payload.reference, userName, applicationStatus.inCheck)
    console.log(`Application ${request.payload.reference}, moved to IN CHECK Status from ON HOLD => ${result}`)
    await crumbCache.generateNewCrumb(request, h)
  }
}

module.exports = {
  method: 'POST',
  path: '/reject-on-hold-claim',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: Joi.object(config.rbac.enabled
        ? {
            confirm: Joi.array().items(
              Joi.string().valid('recommendToMoveOnHoldClaim').required(),
              Joi.string().valid('updateIssuesLog').required()
            ).required(),
            rejectOnHoldClaim: Joi.string().valid('yes').required(),
            reference: Joi.string().valid().required(),
            page: Joi.number().greater(0).default(1)
          }
        : {
            confirm: Joi.array().items(
              Joi.string().valid('recommendToMoveOnHoldClaim'),
              Joi.string().valid('updateIssuesLog')
            ),
            rejectOnHoldClaim: Joi.string().valid('yes'),
            reference: Joi.string().valid(),
            page: Joi.number().greater(0).default(1)
          }),
      failAction: async (request, h, error) => {
        console.log(`routes:reject-on-hold-claim: Error when validating payload: ${JSON.stringify({
          errorMessage: error.message,
          payload: request.payload
        })}`)
        const errors = []
        if (error.details && error.details[0].context.key === 'confirm') {
          errors.push({
            text: 'Select both checkboxes',
            href: '#confirm-move-to-in-check-panel'
          })
        }
        return h
          .redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}&moveToInCheck=true&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
          .takeover()
      }
    },
    handler: async (request, h) => {
      if (config.rbac.enabled) {
        try {
          const userRole = mapAuth(request)
          if (!userRole.isAuthoriser && !userRole.isRecommender && !userRole.isAdministrator) {
            throw Boom.unauthorized('routes:reject-on-hold-claim: User must be an authoriser/recommender or an admin')
          }
          await processRejectOnHoldClaim(request, applicationStatus)
          return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
        } catch (error) {
          console.error(`routes:reject-on-hold-claim: Error when processing request: ${error.message}`)
          throw Boom.internal(error.message)
        }
      } else {
        await processRejectOnHoldClaim(request, applicationStatus, h)
        return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
      }
    }
  }
}
