const {
  administrator,
  processor,
  user,
  recommender,
  authoriser,
} = require("./permissions");
const { superAdmins } = require("../config");

const mapAuth = (request) => {
  const { isAuthenticated, credentials } = request.auth;
  const { username } = credentials.account;

  return {
    isAuthenticated,
    isAdministrator:
      isAuthenticated && credentials.scope.includes(administrator),
    isProcessor: isAuthenticated && credentials.scope.includes(processor),
    isUser: isAuthenticated && credentials.scope.includes(user),
    isRecommender: isAuthenticated && credentials.scope.includes(recommender),
    isAuthoriser: isAuthenticated && credentials.scope.includes(authoriser),
    isSuperAdmin:
      isAuthenticated &&
      credentials.scope.includes(administrator) &&
      superAdmins.includes(username.trim().toLowerCase()),
  };
};

module.exports = mapAuth;
