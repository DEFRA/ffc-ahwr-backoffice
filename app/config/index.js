const joi = require('joi')
const authConfig = require('./auth')

const schema = joi.object({
  cache: {
    expiresIn: joi.number().default(1000 * 3600 * 24 * 3), // 3 days
    options: {
      host: joi.string().default('redis-hostname.default'),
      partition: joi.string().default('ffc-ahwr-backoffice'),
      password: joi.string().allow(''),
      port: joi.number().default(6379),
      tls: joi.object()
    }
  },
  cookie: {
    cookieNameCookiePolicy: joi.string().default('ffc_ahwr_backoffice_cookie_policy'),
    cookieNameAuth: joi.string().default('ffc_ahwr_backoffice_auth'),
    cookieNameSession: joi.string().default('ffc_ahwr_backoffice_session'),
    isSameSite: joi.string().default('Lax'),
    isSecure: joi.boolean().default(true),
    password: joi.string().min(32).required(),
    ttl: joi.number().default(1000 * 3600 * 24 * 3) // 3 days
  },
  cookiePolicy: {
    clearInvalid: joi.bool().default(false),
    encoding: joi.string().valid('base64json').default('base64json'),
    isSameSite: joi.string().default('Lax'),
    isSecure: joi.bool().default(true),
    password: joi.string().min(32).required(),
    path: joi.string().default('/'),
    ttl: joi.number().default(1000 * 60 * 60 * 24 * 365) // 1 year
  },
  env: joi.string().valid('development', 'test', 'production').default('development'),
  isDev: joi.boolean().default(false),
  isProd: joi.boolean().default(false),
  port: joi.number().default(3000),
  serviceName: joi.string().default('Administration of the health and welfare of your livestock'),
  siteTitle: joi.string().default('Administration'),
  serviceUri: joi.string().uri(),
  useRedis: joi.boolean().default(false),
  applicationApiUri: joi.string().uri(),
  displayPageSize: joi.number().default(20),
  dateOfTesting: {
    enabled: joi.bool().default(false)
  },
  onHoldAppScheduler: {
    enabled: joi.bool().default(true),
    schedule: joi.string().default('0 18 * * 1-5')
  },
  endemics: {
    enabled: joi.bool().required()
  },
  multiSpecies: {
    enabled: joi.bool().required()
  },
  superAdmins: joi.array().items(joi.string()).required(),
  developerName: joi.string().allow(''),
  developerUsername: joi.string().allow('')
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
  onHoldAppScheduler: {
    enabled: process.env.ON_HOLD_APP_PROCESS_ENABLED,
    schedule: process.env.ON_HOLD_APP_PROCESS_SCHEDULE
  },
  endemics: {
    enabled: process.env.ENDEMICS_ENABLED === 'true'
  },
  multiSpecies: {
    enabled: process.env.MULTI_SPECIES_ENABLED === 'true'
  },
  superAdmins: process.env.SUPER_ADMINS
    ? process.env.SUPER_ADMINS
        .split(',')
        .map((user) => user.trim().toLowerCase())
    : [],
  developerName: process.env.DEVELOPER_NAME,
  developerUsername: process.env.DEVELOPER_USERNAME
}
const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

value.auth = authConfig

module.exports = value
