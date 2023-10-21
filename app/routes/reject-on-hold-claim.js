const { Buffer } = require('buffer')
const Boom = require('@hapi/boom')
const Joi = require('joi')
const config = require('../config')
const { updateApplicationStatus } = require('../api/applications')
const mapAuth = require('../auth/map-auth')
const getUser = require('../auth/get-user')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')

module.exports = {
  method: 'POST',
  path: '/reject-on-hold-claim',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: Joi.object({
        rejectOnHoldClaim: Joi.string().valid('yes', 'no'),
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1)
      }),
      failAction: async (request, h, error) => {
        console.log(`routes:reject-application-claim: Error when validating payload: ${JSON.stringify({
          errorMessage: error.message,
          payload: request.payload
        })}`)
        const errors = []
        if (error.details) {
          errors.push({
            text: 'Error while moving status to IN CHECK.'
          })
        }
        return h
          .redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}&reject-on-hold=true&errors=${encodeURIComponent(Buffer.from(JSON.stringify(errors)).toString('base64'))}`)
          .takeover()
      }
    },
    handler: async (request, h) => {
      if (config.rbac.enabled) {
        try {
          const userRole = mapAuth(request)
          if (!userRole.isAuthoriser && !userRole.isRecommender && !userRole.isAdministrator) {
            throw Boom.internal('routes:reject-on-hold-claim: User must be an authoriser/recommender or an admin')
          }

          if (request.payload.rejectOnHoldClaim === 'yes') {
            const userName = getUser(request).username
            await updateApplicationStatus(request.payload.reference, userName, 11)
            await crumbCache.generateNewCrumb(request, h)
          }
          return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
        } catch (error) {
          console.error(`routes:reject-on-hold-claim: Error when processing request: ${error.message}`)
          throw Boom.internal(error.message)
        }
      }
    }
  }
}
