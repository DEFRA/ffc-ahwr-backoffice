const Joi = require('joi')

const rejectClaimDisabledRBAC = Joi.object({
  claimOrApplication: Joi.string().valid('claim', 'application').required(),
  rejectClaim: Joi.string().valid('yes', 'no'),
  reference: Joi.string().valid(),
  page: Joi.number().greater(0).default(1)
})
const approveClaimDisabledRBAC = Joi.object({
  claimOrApplication: Joi.string().valid('claim', 'application').required(),
  approveClaim: Joi.string().valid('yes', 'no'),
  reference: Joi.string().valid(),
  page: Joi.number().greater(0).default(1)
})
const rejectClaimEnabledRBAC = Joi.object({
  claimOrApplication: Joi.string().valid('claim', 'application').required(),
  confirm: Joi.array().items(
    Joi.string().valid('rejectClaim').required(),
    Joi.string().valid('sentChecklist').required()
  ).required(),
  reference: Joi.string().valid().required(),
  page: Joi.number().greater(0).default(1)
})
const approveClaimEnabledRBAC = Joi.object({
  claimOrApplication: Joi.string().valid('claim', 'application').required(),
  confirm: Joi.array().items(
    Joi.string().valid('approveClaim').required(),
    Joi.string().valid('sentChecklist').required()
  ).required(),
  reference: Joi.string().valid().required(),
  page: Joi.number().greater(0).default(1)
})

module.exports = {
  rejectClaimDisabledRBAC,
  approveClaimDisabledRBAC,
  rejectClaimEnabledRBAC,
  approveClaimEnabledRBAC
}
