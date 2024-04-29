const Joi = require('joi')
const { Buffer } = require('buffer')
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
        withdrawConfirmation: Joi.string().valid('yes').required(),
        confirm: Joi.array().items(
          Joi.string().valid('SentCopyOfRequest').required(),
          Joi.string().valid('attachedCopyOfCustomersRecord').required(),
          Joi.string().valid('receivedCopyOfCustomersRequest').required()
        ).required(),
        reference: Joi.string().required(),
        page: Joi.number().greater(0).default(1)
      }),
      failAction: async (request, h) => {
        return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page || 1}&withdraw=true&errors=${encodeURIComponent(Buffer.from(JSON.stringify([{ text: 'Select all checkboxes', href: '#pnl-withdraw-confirmation' }])).toString('base64'))}`).takeover()
      }
    },
    handler: async (request, h) => {
      const userName = getUser(request).username
      await updateApplicationStatus(request.payload.reference, userName, applicationStatus.withdrawn)
      await crumbCache.generateNewCrumb(request, h)

      return h.redirect(`/view-application/${request.payload.reference}?page=${request?.payload?.page}`)
    }
  }
}
