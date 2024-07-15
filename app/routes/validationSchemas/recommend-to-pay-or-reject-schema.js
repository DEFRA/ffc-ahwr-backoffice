const Joi = require('joi')

const recommendToPayOrRejectSchema =
  Joi.object({
    claimOrApplication: Joi.string().valid('claim', 'application').required(),
    confirm: Joi.array().items(
      Joi.string().valid('checkedAgainstChecklist').required(),
      Joi.string().valid('sentChecklist').required()
    ).required(),
    reference: Joi.string().valid().required(),
    page: Joi.number().greater(0).default(1),
    returnPage: Joi.string().allow('').optional()
  })

module.exports = recommendToPayOrRejectSchema
