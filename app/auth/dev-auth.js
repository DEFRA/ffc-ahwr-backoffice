const {
  administrator,
  processor,
  user,
  recommender,
  authoriser,
} = require("./permissions");
const { developerName, developerUsername } = require("../config");

const getDevAccount = (userId) => {
  if (userId) {
    return {
      name: `Developer-${userId}`,
      username: `developer+${userId}@defra.gov.uk`,
    }
  }

  return {
    name: developerName || "Developer",
    username: developerUsername || "developer@defra.gov.uk",
  }
};

const getAuthenticationUrl = (userId) => {
  if (userId) {
    return `/dev-auth?userId=${userId}`
  }
  
  return "/dev-auth";
};

const authenticate = async (userId, cookieAuth) => {
  cookieAuth.set({
    scope: [administrator, processor, user, recommender, authoriser],
    account: getDevAccount(userId),
  });
};

const refresh = async (_account, cookieAuth) => {
  cookieAuth.set({
    scope: [administrator, processor, user, recommender, authoriser],
    account: getDevAccount(),
  });

  return [administrator, processor, user, recommender, authoriser];
};

const logout = async () => {};

module.exports = {
  getAuthenticationUrl,
  authenticate,
  refresh,
  logout,
};
