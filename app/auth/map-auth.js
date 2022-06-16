const isInRole = require('./is-in-role')
const { schemeAdmin, holdAdmin } = require('./permissions')

const mapAuth = (request) => {
  return {
    isAuthenticated: request.auth.isAuthenticated,
    isAnonymous: !request.auth.isAuthenticated,
    isSchemeAdminUser: request.auth.isAuthenticated && isInRole(request.auth.credentials, schemeAdmin),
    isHoldAdminUser: request.auth.isAuthenticated && isInRole(request.auth.credentials, holdAdmin)
  }
}

module.exports = mapAuth
