import joi from "joi";

const buildAuthConfig = () => {
  const schema = joi.object({
    enabled: joi.boolean(),
    clientSecret: joi.string().allow(""),
    clientId: joi.string().allow(""),
    authority: joi.string().allow(""),
    redirectUrl: joi.string(),
  });

  const config = {
    enabled: process.env.AADAR_ENABLED === "true",
    clientSecret: process.env.AADAR_CLIENT_SECRET,
    clientId: process.env.AADAR_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AADAR_TENANT_ID}`,
    redirectUrl: process.env.AADAR_REDIRECT_URL,
  };

  if (process.env.NODE_ENV === "test") {
    return config;
  }

  const { error } = schema.validate(config, { abortEarly: false });

  if (error) {
    throw new Error(`The auth config is invalid. ${error.message}`);
  }

  return config;
};

export const authConfig = buildAuthConfig();
