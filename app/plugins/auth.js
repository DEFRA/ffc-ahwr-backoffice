import { config } from "../config/index.js";
import authCookie from "@hapi/cookie";

export const SESSION_AUTH = "session-auth";

export const authPlugin = {
  plugin: {
    name: "auth",
    register: async (server) => {
      await server.register(authCookie);

      const sessionCache = server.cache({
        segment: SESSION_AUTH,
        expiresIn: config.cache.expiresIn,
      });
      const saveSession = async (id, data) => sessionCache.set(id, data);
      const getSession = async (id) => sessionCache.get(id);

      server.auth.strategy(SESSION_AUTH, "cookie", {
        cookie: {
          name: SESSION_AUTH,
          password: config.cookie.password,
          ttl: config.cookie.ttl,
          path: "/",
          isSecure: config.isProd,
          isSameSite: "Lax", // Needed for the post authentication redirect
        },
        keepAlive: false,
        redirectTo: "/login",
        validateFunc: async (_request, session) => {
          const sessionFromCache = await getSession(session.id);
          if (!sessionFromCache) {
            return { valid: false };
          }
          return {
            valid: true,
            credentials: {
              account: sessionFromCache.account,
              scope: sessionFromCache.scope,
            },
          };
        },
      });

      server.auth.default(SESSION_AUTH);

      server.expose({
        createSession: async (account, scope) => {
          const sessionId = crypto.randomUUID();
          await saveSession(sessionId, { account, scope });
          return sessionId;
        },
      });
    },
  },
};
