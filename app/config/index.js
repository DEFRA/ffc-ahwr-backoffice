const Joi = require('joi')
const authConfig = require('./auth')

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
  env: Joi.string().valid('development', 'test', 'production').default('development'),
  isDev: Joi.boolean().default(false),
  isProd: Joi.boolean().default(false),
  port: Joi.number().default(3000),
  serviceName: Joi.string().default('Administration of the health and welfare of your livestock'),
  siteTitle: Joi.string().default('Administration'),
  serviceUri: Joi.string().uri(),
  useRedis: Joi.boolean().default(false),
  applicationApiUri: Joi.string().uri(),
  displayPageSize: Joi.number().default(20),
  rbac: {
    enabled: Joi.boolean().default(false)
  },
  dateOfTesting: {
    enabled: Joi.bool().default(false)
  },
  onHoldAppScheduler: {
    enabled: Joi.bool().default(true),
    schedule: Joi.string().default('0 18 * * 1-5')
  }
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
  env: process.env.NODE_ENV,
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: process.env.PORT,
  serviceUri: process.env.SERVICE_URI,
  useRedis: process.env.NODE_ENV !== 'test',
  applicationApiUri: process.env.APPLICATION_API_URI,
  displayPageSize: process.env.DISPLAY_PAGE_SIZE,
  rbac: {
    enabled: process.env.RBAC_ENABLED
  },
  dateOfTesting: {
    enabled: process.env.DATE_OF_TESTING_ENABLED
  },
  onHoldAppScheduler: {
    enabled: process.env.ON_HOLD_APP_PROCESS_ENABLED,
    schedule: process.env.ON_HOLD_APP_PROCESS_SCHEDULE
  }
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

value.auth = authConfig

module.exports = value
