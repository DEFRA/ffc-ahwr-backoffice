const Joi = require('joi')
const { Buffer } = require('buffer')
const getUser = require('../auth/get-user')
const crumbCache = require('./utils/crumb-cache')
const { administrator, authoriser } = require('../auth/permissions')
const { updateApplicationStatus } = require('../api/applications')
const applicationStatus = require('../constants/application-status')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const { endemics } = require('../config')

module.exports = {
  method: 'POST',
  path: '/withdraw-agreement',
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    auth: { scope: [administrator, authoriser] },
    handler: async (request, h) => {
      await crumbCache.generateNewCrumb(request, h)

      const endemicsOffValidation = Joi.object({
        withdrawConfirmation: Joi.string().valid('yes', 'no').required(),
        reference: Joi.string().required(),
        page: Joi.number().greater(0).default(1)
      })
      const endemicsOnValidation = Joi.object({
        withdrawConfirmation: Joi.string().valid('yes', 'no').required(),
        ...(endemics.enabled && {
          confirm: Joi.array().items(
            Joi.string().valid('SentCopyOfRequest').required(),
            Joi.string().valid('attachedCopyOfCustomersRecord').required(),
            Joi.string().valid('receivedCopyOfCustomersRequest').required()
          ).required()
        }),
        reference: Joi.string().required(),
        page: Joi.number().greater(0).default(1)
      })

      const { error } = endemics.enabled ? endemicsOnValidation.validate(request.payload) : endemicsOffValidation.validate(request.payload)

      if (error) {
        return h.redirect(`/view-agreement/${request.payload.reference}?page=${request?.payload?.page || 1}&withdraw=true&errors=${encodeURIComponent(Buffer.from(JSON.stringify([{ text: 'Select all checkboxes', href: '#pnl-withdraw-confirmation' }])).toString('base64'))}`).takeover()
      }

      if (endemics.enabled) {
        const userName = getUser(request).username
        await updateApplicationStatus(request.payload.reference, userName, applicationStatus.withdrawn)

        return h.redirect(`/view-agreement/${request.payload.reference}?page=${request?.payload?.page}`)
      } else {
        if (request.payload.withdrawConfirmation === 'yes') {
          const userName = getUser(request).username
          await updateApplicationStatus(request.payload.reference, userName, applicationStatus.withdrawn)
        }

        return h.redirect(`/view-agreement/${request.payload.reference}?page=${request?.payload?.page}`)
      }
    }
  }
}
