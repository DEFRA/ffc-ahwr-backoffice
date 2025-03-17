const joi = require("joi");

const schema = joi.object({
  enabled: joi.boolean().default(false),
  clientSecret: joi.string().allow(""),
  clientId: joi.string().allow(""),
  authority: joi.string().allow(""),
  redirectUrl: joi.string(),
});

const config = {
  enabled: process.env.AADAR_ENABLED,
  clientSecret: process.env.AADAR_CLIENT_SECRET,
  clientId: process.env.AADAR_CLIENT_ID,
  authority: `https://login.microsoftonline.com/${process.env.AADAR_TENANT_ID}`,
  redirectUrl: process.env.AADAR_REDIRECT_URL,
};

const { error, value } = schema.validate(config, { abortEarly: false });

if (error) {
  throw new Error(`The auth config is invalid. ${error.message}`);
}

module.exports = value;
