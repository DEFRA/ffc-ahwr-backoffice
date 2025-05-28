const config = require("../config");
const auth = config.auth.enabled ? require("./azure-auth") : require("./dev-auth");
const mapAuth = require("./map-auth");

module.exports = {
  ...auth,
  mapAuth,
};
