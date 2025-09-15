import { auth } from "../auth/index.js";
import { StatusCodes } from "http-status-codes";
import { setUserDetails } from "../session/index.js";
import { upperFirstLetter } from "../lib/display-helper.js";

export const devAuthRoute = {
  method: "GET",
  path: "/dev-auth",
  options: {
    auth: false,
  },
  handler: async (request, h) => {
    try {
      const { userId } = request.query;
      const [username, roles] = await auth.authenticate(userId, request.cookieAuth);

      setUserDetails(request, "user", username);
      setUserDetails(request, "roles", roles.map((x) => upperFirstLetter(x)).join(", "));
      return h.redirect("/");
    } catch (err) {
      request.logger.setBindings({ err });
    }
    return h.view("error-pages/500").code(StatusCodes.INTERNAL_SERVER_ERROR);
  },
};
