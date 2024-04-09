const Joi = require('joi')
const { updateApplicationStatus } = require('../api/applications')
const { administrator } = require('../auth/permissions')
const getUser = require('../auth/get-user')
const applicationStatus = require('../constants/application-status')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')

module.exports = {
  method: 'POST',
  path: '/withdraw-application',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    auth: { scope: [administrator] },
    validate: {
      payload: Joi.object({
        claimOrApplication: Joi.string().valid('claim', 'application').required(),
        withdrawConfirmation: Joi.string().valid('yes', 'no'),
        reference: Joi.string().valid(),
        page: Joi.number().greater(0).default(1)
      })
    },
    handler: async (request, h) => {
      if (request.payload.withdrawConfirmation === 'yes') {
        const userName = getUser(request).username
        await updateApplicationStatus(request.payload.reference, userName, applicationStatus.withdrawn)
        await crumbCache.generateNewCrumb(request, h)
      }

      if (request.payload.claimOrApplication === 'claim') {
        return h.redirect(`/view-claim/${request.payload.reference}`)
      } else {
        return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}`)
      }
    }
  }
}
