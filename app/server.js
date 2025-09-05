import { config } from "./config/index.js";
import Hapi from "@hapi/hapi";
import catboxRedis from "@hapi/catbox-redis";
import { scheduler as processOnHoldScheduler } from "./crons/process-on-hold/scheduler.js";
import { scheduler as dataRedactionScheduler } from "./crons/data-redaction/scheduler.js";
import { authPlugin } from "./plugins/auth.js";
import { cookiePlugin } from "./plugins/cookies.js";
import { crumbPlugin } from "./plugins/crumb.js";
import { errorPagesPlugin } from "./plugins/error-pages.js";
import { headerPlugin } from "./plugins/header.js";
import { loggerPlugin } from "./plugins/logger.js";
import { routerPlugin } from "./plugins/router.js";
import { sessionPlugin } from "./plugins/session.js";
import { viewsPlugin } from "./plugins/views.js";
import { inertPlugin } from "./plugins/inert.js";

const catbox = catboxRedis;
const cacheConfig = config.cache.options;

export async function createServer() {
  const server = Hapi.server({
    cache: [
      {
        provider: {
          constructor: catbox,
          options: cacheConfig,
        },
      },
    ],
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false,
        },
      },
    },
    router: {
      stripTrailingSlash: true,
    },
  });

  const submissionCrumbCache = server.cache({
    expiresIn: 1000 * 60 * 60 * 24,
    segment: "submissionCrumbs",
  }); // 24 hours
  server.app.submissionCrumbCache = submissionCrumbCache;

  await server.register(authPlugin);
  await server.register(crumbPlugin);
  await server.register(inertPlugin);
  await server.register(routerPlugin);
  await server.register(viewsPlugin);
  await server.register(sessionPlugin);
  await server.register(cookiePlugin);
  await server.register(errorPagesPlugin);
  await server.register(loggerPlugin);
  await server.register(headerPlugin);

  if (process.env.NODE_ENV !== "test") {
    await server.register(processOnHoldScheduler);
    await server.register(dataRedactionScheduler);
  }

  return server;
}
