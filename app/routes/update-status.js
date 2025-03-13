const joi = require('joi')
const { administrator } = require('../auth/permissions')
const { updateClaimStatus } = require('../api/claims')
const { updateApplicationStatus } = require('../api/applications')
const { processApplicationClaim } = require('../api/applications')
const crumbCache = require('./utils/crumb-cache')
const { encodeErrorsForUI } = require('./utils/encode-errors-for-ui')
const { readyToPay, rejected } = require('../constants/application-status')

module.exports = {
  method: 'post',
  path: '/update-status',
  options: {
    auth: { scope: [administrator] },
    validate: {
      payload: joi.object({
        claimOrAgreement: joi.string().valid('claim', 'agreement').required(),
        reference: joi.string().required(),
        status: joi.number().required(),
        note: joi.string().required().messages({
          'any.required': 'Enter note',
          'string.empty': 'Enter note'
        }),
        page: joi.number().greater(0).default(1),
        returnPage: joi.string().optional().allow('').valid('agreement', 'claims')
      }),
      failAction: async (request, h, err) => {
        const { claimOrAgreement, page, reference, returnPage } = request.payload

        request.logger.setBindings({ err, reference })

        const errors = encodeErrorsForUI(err.details, '#update-status')
        const query = new URLSearchParams({ page, updateStatus: 'true', errors })

        if (claimOrAgreement === 'claim') {
          query.append('returnPage', returnPage)
        }

        return h
          .redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`)
          .takeover()
      }
    },
    handler: async (request, h) => {
      const { claimOrAgreement, page, reference, returnPage, status, note } = request.payload
      const { name } = request.auth.credentials.account

      request.logger.setBindings({ status, reference })

      await crumbCache.generateNewCrumb(request, h)
      const query = new URLSearchParams({ page })

      if (claimOrAgreement === 'claim') {
        query.append('returnPage', returnPage)
        await updateClaimStatus(reference, name, status, request.logger, note)
      }

      if (
        claimOrAgreement === 'agreement' &&
        status !== readyToPay && status !== rejected
      ) {
        await updateApplicationStatus(reference, name, status, request.logger, note)
      }

      if (
        claimOrAgreement === 'agreement' &&
        (status === readyToPay || status === rejected)
      ) {
        const isClaimToBePaid = status === readyToPay
        await processApplicationClaim(reference, name, isClaimToBePaid, request.logger, note)
      }

      return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`)
    }
  }
}
