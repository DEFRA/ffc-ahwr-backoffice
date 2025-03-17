const auth = require("../auth");

module.exports = {
  method: "GET",
  path: "/login",
  options: {
    auth: false,
  },
  handler: async (request, h) => {
    try {
      const authUrl = await auth.getAuthenticationUrl();
      return h.redirect(authUrl);
    } catch (err) {
      request.logger.setBindings({ err });
    }
    return h.view("error-pages/500").code(500);
  },
};
