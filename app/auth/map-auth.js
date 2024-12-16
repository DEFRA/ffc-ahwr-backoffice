const isInRole = require('./is-in-role')
const { administrator, processor, user, recommender, authoriser } = require('./permissions')

const mapAuth = (request) => {
  return {
    isAuthenticated: request.auth.isAuthenticated,
    isAnonymous: !request.auth.isAuthenticated,
    isAdministrator: request.auth.isAuthenticated && isInRole(request.auth.credentials, administrator),
    isProcessor: request.auth.isAuthenticated && isInRole(request.auth.credentials, processor),
    isUser: request.auth.isAuthenticated && isInRole(request.auth.credentials, user),
    isRecommender: request.auth.isAuthenticated && isInRole(request.auth.credentials, recommender),
    isAuthoriser: request.auth.isAuthenticated && isInRole(request.auth.credentials, authoriser)
  }
}

module.exports = mapAuth
