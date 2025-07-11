import { auth } from "../auth/index.js";

export const authenticateRoute = {
  method: "GET",
  path: "/authenticate",
  options: {
    auth: { mode: "try" },
  },
  handler: async (request, h) => {
    try {
      await auth.authenticate(request.query.code, request.cookieAuth);
      return h.redirect("/claims");
    } catch (err) {
      request.logger.setBindings({ err });
      request.logger.error(err.message);
    }

    return h.view("error-pages/500").code(500);
  },
};
