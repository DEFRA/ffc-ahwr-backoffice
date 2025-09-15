import { auth } from "../auth/index.js";
import { StatusCodes } from "http-status-codes";
import { setUserDetails } from "../session/index.js";
import { upperFirstLetter } from "../lib/display-helper.js";

export const authenticateRoute = {
  method: "GET",
  path: "/authenticate",
  options: {
    auth: { mode: "try" },
  },
  handler: async (request, h) => {
    try {
      const [username, roles] = await auth.authenticate(request.query.code, request.cookieAuth);
      setUserDetails(request, "user", username);
      setUserDetails(request, "roles", roles.map((x) => upperFirstLetter(x)).join(", "));
      return h.redirect("/claims");
    } catch (err) {
      request.logger.setBindings({ err });
      request.logger.error(err.message);
    }

    return h.view("error-pages/500").code(StatusCodes.INTERNAL_SERVER_ERROR);
  },
};
