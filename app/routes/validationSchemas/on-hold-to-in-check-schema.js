const Joi = require('joi')

const onHoldToInCheckSchema = Joi.object({
  claimOrApplication: Joi.string().valid('claim', 'application').required(),
  confirm: Joi.array().items(
    Joi.string().valid('recommendToMoveOnHoldClaim').required(),
    Joi.string().valid('updateIssuesLog').required()
  ).required(),
  rejectOnHoldClaim: Joi.string().valid('yes').required(),
  reference: Joi.string().valid().required(),
  page: Joi.number().greater(0).default(1)
})

module.exports = { onHoldToInCheckSchema }
