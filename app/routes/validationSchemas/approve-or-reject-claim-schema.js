const Joi = require('joi')

const rejectClaim = Joi.object({
  claimOrApplication: Joi.string().valid('claim', 'application').required(),
  confirm: Joi.array().items(
    Joi.string().valid('rejectClaim').required(),
    Joi.string().valid('sentChecklist').required()
  ).required(),
  reference: Joi.string().valid().required(),
  page: Joi.number().greater(0).default(1)
})
const approveClaim = Joi.object({
  claimOrApplication: Joi.string().valid('claim', 'application').required(),
  confirm: Joi.array().items(
    Joi.string().valid('approveClaim').required(),
    Joi.string().valid('sentChecklist').required()
  ).required(),
  reference: Joi.string().valid().required(),
  page: Joi.number().greater(0).default(1)
})

module.exports = {
  rejectClaim,
  approveClaim
}
