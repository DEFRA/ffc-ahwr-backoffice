const isInRole = require('./is-in-role')
const { administrator, processor, user } = require('./permissions')

const mapAuth = (request) => {
  return {
    isAuthenticated: request.auth.isAuthenticated,
    isAnonymous: !request.auth.isAuthenticated,
    isAdministrator: request.auth.isAuthenticated && isInRole(request.auth.credentials, administrator),
    isProcessor: request.auth.isAuthenticated && isInRole(request.auth.credentials, processor),
    isUser: request.auth.isAuthenticated && isInRole(request.auth.credentials, user)
  }
}

module.exports = mapAuth
