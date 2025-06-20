import { permissions } from "./permissions.js";
import { config } from "../config/index.js";

const { administrator, processor, user, recommender, authoriser } = permissions;
const { superAdmins } = config;

export const mapAuth = (request) => {
  const { isAuthenticated, credentials } = request.auth;
  const { username } = credentials.account;

  return {
    isAuthenticated,
    isAdministrator: isAuthenticated && credentials.scope.includes(administrator),
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
