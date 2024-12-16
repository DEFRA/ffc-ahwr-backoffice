const Joi = require('joi')

const schema = Joi.object({
  enabled: Joi.boolean().default(false),
  clientSecret: Joi.string().allow(''),
  clientId: Joi.string().allow(''),
  authority: Joi.string().allow(''),
  redirectUrl: Joi.string()
})

const config = {
  enabled: process.env.AADAR_ENABLED,
  clientSecret: process.env.AADAR_CLIENT_SECRET,
  clientId: process.env.AADAR_CLIENT_ID,
  authority: `https://login.microsoftonline.com/${process.env.AADAR_TENANT_ID}`,
  redirectUrl: process.env.AADAR_REDIRECT_URL
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The auth config is invalid. ${error.message}`)
} else {
  console.log('config', JSON.stringify(value))
}

module.exports = value
