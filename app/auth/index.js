const config = require('../config')
const auth = config.auth.enabled ? require('./azure-auth') : require('./dev-auth')
const mapAuth = require('./map-auth')
const getUser = require('./get-user')

module.exports = {
  ...auth,
  mapAuth,
  getUser
}
