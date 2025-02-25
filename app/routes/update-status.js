const joi = require('joi')
const { administrator } = require('../auth/permissions')
const { updateClaimStatus } = require('../api/claims')
const { updateApplicationStatus } = require('../api/applications')
const { processApplicationClaim } = require('../api/applications')
const getUser = require('../auth/get-user')
const crumbCache = require('./utils/crumb-cache')
const { prepareValidationErrors } = require('./utils/prepare-validation-errors')
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
        status: joi.string().required(),
        note: joi.string().required().messages({
          'string.empty': 'Enter note'
        }),
        page: joi.string().default(1),
        returnPage: joi.string().optional().valid('agreement', 'claims').allow('')
      }),
      failAction: async (request, h, err) => {
        const { claimOrAgreement, page, reference, returnPage } = request.payload

        request.logger.setBindings({ err, reference })

        const errors = prepareValidationErrors(err.details, '#update-status')
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
      const { username } = getUser(request)

      request.logger.setBindings({ status, reference })

      await crumbCache.generateNewCrumb(request, h)
      const query = new URLSearchParams({ page })
      console.log('updateing claim', status)
      if (claimOrAgreement === 'claim') {
        query.append('returnPage', returnPage)
        await updateClaimStatus(reference, username, status, request.logger, note)
      }

      if (
        claimOrAgreement === 'agreement'
        && status !== readyToPay && status !== rejected
      ) {
        await updateApplicationStatus(reference, username, status, request.logger, note)
      }

      if (
        claimOrAgreement === 'agreement'
        && (status === readyToPay || status === rejected)
      ) {
        const isClaimToBePaid = status === readyToPay
        await processApplicationClaim(reference, username, isClaimToBePaid, request.logger, note)
      }

      return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`)
    }
  }
}
