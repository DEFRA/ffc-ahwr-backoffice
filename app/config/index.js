import joi from "joi";
import { authConfig } from "./auth.js";

const SECONDS_PER_HOUR = 3600;
const MILLISECONDS_PER_SECOND = 1000;
const HOURS_PER_DAY = 24;
const NUMBER_OF_DAYS = 3;
const ONE_YEAR_IN_DAYS = 365;

const getCookieConfigSchema = () => ({
  cookieNameCookiePolicy: joi.string().required(),
  cookieNameAuth: joi.string().required(),
  cookieNameSession: joi.string().required(),
  isSameSite: joi.string().required(),
  isSecure: joi.boolean().required(),
  password: joi.string().min(32).required(),
  ttl: joi.number().required(),
});

const getCacheConfigSchema = () => ({
  expiresIn: joi.number().required(),
  options: {
    host: joi.string().required(),
    partition: joi.string().required(),
    password: joi.string().allow("").required(),
    port: joi.number().required(),
    tls: joi.object(),
  },
});

const getCookiePolicyConfigSchema = () => ({
  clearInvalid: joi.bool().required(),
  encoding: joi.string().required(),
  isSameSite: joi.string().required(),
  isSecure: joi.bool().required(),
  password: joi.string().min(32).required(),
  path: joi.string().required(),
  ttl: joi.number().required(),
});

const buildConfig = () => {
  const schema = joi.object({
    cache: getCacheConfigSchema(),
    cookie: getCookieConfigSchema(),
    cookiePolicy: getCookiePolicyConfigSchema(),
    env: joi.string().valid("development", "test", "production").required(),
    isDev: joi.boolean().required(),
    isProd: joi.boolean().required(),
    port: joi.number().required(),
    serviceUri: joi.string().uri().required(),
    useRedis: joi.boolean().required(),
    applicationApiUri: joi.string().uri().required(),
    displayPageSize: joi.number().required(),
    onHoldAppScheduler: {
      enabled: joi.bool().required(),
      schedule: joi.string().required(),
    },
    superAdmins: joi.array().items(joi.string()).required().required(),
    multiHerdsEnabled: joi.boolean().required().required(),
  });

  const conf = {
    cache: {
      expiresIn: MILLISECONDS_PER_SECOND * SECONDS_PER_HOUR * HOURS_PER_DAY * NUMBER_OF_DAYS,
      options: {
        host: process.env.REDIS_HOSTNAME,
        password: process.env.REDIS_PASSWORD,
        port: process.env.REDIS_PORT,
        tls: process.env.NODE_ENV === "production" ? {} : undefined,
        partition: "ffc-ahwr-backoffice",
      },
    },
    cookie: {
      cookieNameCookiePolicy: "ffc_ahwr_backoffice_cookie_policy",
      cookieNameAuth: "ffc_ahwr_backoffice_auth",
      cookieNameSession: "ffc_ahwr_backoffice_session",
      isSameSite: "Lax",
      isSecure: process.env.NODE_ENV === "production",
      password: process.env.COOKIE_PASSWORD,
      ttl: MILLISECONDS_PER_SECOND * SECONDS_PER_HOUR * HOURS_PER_DAY * NUMBER_OF_DAYS,
    },
    cookiePolicy: {
      clearInvalid: false,
      encoding: "base64json",
      isSameSite: "Lax",
      isSecure: process.env.NODE_ENV === "production",
      password: process.env.COOKIE_PASSWORD,
      path: "/",
      ttl: MILLISECONDS_PER_SECOND * SECONDS_PER_HOUR * HOURS_PER_DAY * ONE_YEAR_IN_DAYS,
    },
    env: process.env.NODE_ENV,
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",
    port: process.env.PORT,
    serviceUri: process.env.SERVICE_URI,
    useRedis: process.env.NODE_ENV !== "test",
    applicationApiUri: process.env.APPLICATION_API_URI,
    displayPageSize: Number(process.env.DISPLAY_PAGE_SIZE),
    onHoldAppScheduler: {
      enabled: process.env.ON_HOLD_APP_PROCESS_ENABLED === "true",
      schedule: process.env.ON_HOLD_APP_PROCESS_SCHEDULE,
    },
    superAdmins: process.env.SUPER_ADMINS
      ? process.env.SUPER_ADMINS.split(",").map((user) => user.trim().toLowerCase())
      : [],
    multiHerdsEnabled: process.env.MULTI_HERDS_ENABLED === "true",
  };

  if (process.env.NODE_ENV === "test") {
    return { ...conf, auth: authConfig };
  }

  const { error } = schema.validate(conf, { abortEarly: false });

  if (error) {
    throw new Error(`The server config is invalid. ${error.message}`);
  }

  return { ...conf, auth: authConfig };
};

export const config = buildConfig();
