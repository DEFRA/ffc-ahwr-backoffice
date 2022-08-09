const Joi = require('joi')
const schema = Joi.object({
  cache: {
    expiresIn: Joi.number().default(1000 * 3600 * 24 * 3), // 3 days
    options: {
      host: Joi.string().default('redis-hostname.default'),
      partition: Joi.string().default('ffc-ahwr-backoffice'),
      password: Joi.string().allow(''),
      port: Joi.number().default(6379),
      tls: Joi.object()
    }
  },
  cookie: {
    cookieNameCookiePolicy: Joi.string().default('ffc_ahwr_backoffice_cookie_policy'),
    cookieNameAuth: Joi.string().default('ffc_ahwr_backoffice_auth'),
    cookieNameSession: Joi.string().default('ffc_ahwr_backoffice_session'),
    isSameSite: Joi.string().default('Lax'),
    isSecure: Joi.boolean().default(true),
    password: Joi.string().min(32).required(),
    ttl: Joi.number().default(1000 * 3600 * 24 * 3) // 3 days
  },
  cookiePolicy: {
    clearInvalid: Joi.bool().default(false),
    encoding: Joi.string().valid('base64json').default('base64json'),
    isSameSite: Joi.string().default('Lax'),
    isSecure: Joi.bool().default(true),
    password: Joi.string().min(32).required(),
    path: Joi.string().default('/'),
    ttl: Joi.number().default(1000 * 60 * 60 * 24 * 365) // 1 year
  },
  auth: {
    enabled: Joi.boolean().default(false),
    clientSecret: Joi.string().allow(''),
    clientId: Joi.string().allow(''),
    authority: Joi.string().allow(''),
    redirectUrl: Joi.string().default('http://localhost:3002/authenticate')
  },
  env: Joi.string().valid('development', 'test', 'production').default('development'),
  isDev: Joi.boolean().default(false),
  isProd: Joi.boolean().default(false),
  port: Joi.number().default(3000),
  serviceName: Joi.string().default('Administration of the health and welfare of your livestock'),
  siteTitle: Joi.string().default('Back office'),
  serviceUri: Joi.string().uri(),
  useRedis: Joi.boolean().default(false),
  applicationApiUri: Joi.string().uri(),
  displayPageSize: Joi.number().default(20)
})

const config = {
  cache: {
    options: {
      host: process.env.REDIS_HOSTNAME,
      password: process.env.REDIS_PASSWORD,
      port: process.env.REDIS_PORT,
      tls: process.env.NODE_ENV === 'production' ? {} : undefined
    }
  },
  cookie: {
    cookieNameCookiePolicy: 'ffc_ahwr_backoffice_cookie_policy',
    cookieNameAuth: 'ffc_ahwr_backoffice_auth',
    cookieNameSession: 'ffc_ahwr_backoffice_session',
    isSameSite: 'Lax',
    isSecure: process.env.NODE_ENV === 'production',
    password: process.env.COOKIE_PASSWORD,
    ttl: process.env.COOKIE_TTL
  },
  cookiePolicy: {
    clearInvalid: false,
    encoding: 'base64json',
    isSameSite: 'Lax',
    isSecure: process.env.NODE_ENV === 'production',
    password: process.env.COOKIE_PASSWORD
  },
  auth: {
    enabled: process.env.AADAR_ENABLED,
    clientSecret: process.env.AADAR_CLIENT_SECRET,
    clientId: process.env.AADAR_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AADAR_TENANT_ID}`,
    redirectUrl: process.env.AADAR_REDIRECT_URL
  },
  env: process.env.NODE_ENV,
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: process.env.PORT,
  serviceUri: process.env.SERVICE_URI,
  useRedis: process.env.NODE_ENV !== 'test',
  applicationApiUri: process.env.APPLICATION_API_URI,
  displayPageSize: process.env.DISPLAY_PAGE_SIZE
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

module.exports = value
