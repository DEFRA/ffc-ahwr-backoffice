const joi = require('joi')
const getUser = require('../auth/get-user')
const preDoubleSubmitHandler = require('./utils/pre-submission-handler')
const crumbCache = require('./utils/crumb-cache')
const { processApplicationClaim } = require('../api/applications')
const { updateClaimStatus } = require('../api/claims')
const { encodeErrorsForUI } = require('./utils/encode-errors-for-ui')
const { administrator, authoriser } = require('../auth/permissions')
const { rejected } = require('../constants/application-status')

module.exports = {
  method: 'post',
  path: '/reject-application-claim',
  options: {
    auth: { scope: [administrator, authoriser] },
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: joi.object({
        claimOrAgreement: joi.string().valid('claim', 'agreement').required(),
        confirm: joi.array().items(
          joi.string().valid('rejectClaim').required(),
          joi.string().valid('sentChecklist').required()
        ).required().messages({
          'any.required': 'Select all checkboxes',
          'array.base': 'Select all checkboxes'
        }),
        reference: joi.string().valid().required(),
        page: joi.number().greater(0).default(1),
        returnPage: joi.string().optional().allow('').valid('agreement', 'claims')
      }),
      failAction: async (request, h, err) => {
        const { claimOrAgreement, page, reference, returnPage } = request.payload

        request.logger.setBindings({ err, reference })

        const errors = encodeErrorsForUI(err.details, '#reject')
        const query = new URLSearchParams({ page, reject: 'true', errors })

        if (claimOrAgreement === 'claim') {
          query.append('returnPage', returnPage)
        }

        return h
          .redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`)
          .takeover()
      }
    },
    handler: async (request, h) => {
      const { claimOrAgreement, page, reference, returnPage } = request.payload
      const { username } = getUser(request)

      request.logger.setBindings({ reference })

      await crumbCache.generateNewCrumb(request, h)
      const query = new URLSearchParams({ page })

      if (claimOrAgreement === 'claim') {
        query.append('returnPage', returnPage)
        await updateClaimStatus(reference, username, rejected, request.logger)
      } else {
        const isClaimToBePaid = false
        await processApplicationClaim(reference, username, isClaimToBePaid, request.logger)
      }

      return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`)
    }
  }
}
