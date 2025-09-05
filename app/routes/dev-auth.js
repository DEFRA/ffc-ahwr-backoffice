import { auth } from "../auth/index.js";
import { StatusCodes } from "http-status-codes";

export const devAuthRoute = {
  method: "GET",
  path: "/dev-auth",
  options: {
    auth: false,
  },
  handler: async (request, h) => {
    try {
      const { userId } = request.query;
      await auth.authenticate(userId, request.cookieAuth);
      return h.redirect("/");
    } catch (err) {
      request.logger.setBindings({ err });
    }
    return h.view("error-pages/500").code(StatusCodes.INTERNAL_SERVER_ERROR);
  },
};
