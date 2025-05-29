const { administrator, processor, user, recommender, authoriser } = require("./permissions");

let cachedUserId;

const getDevAccount = (userId) => {
  if (userId) {
    cachedUserId = userId;

    return {
      name: `Developer-${userId}`,
      username: `developer+${userId}@defra.gov.uk`,
    };
  }

  return {
    name: "Developer",
    username: "developer@defra.gov.uk",
  };
};

const getAuthenticationUrl = (userId) => {
  if (userId) {
    return `/dev-auth?userId=${userId}`;
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
    account: getDevAccount(cachedUserId),
  });

  return [administrator, processor, user, recommender, authoriser];
};

const logout = async () => {};

module.exports = {
  getAuthenticationUrl,
  authenticate,
  refresh,
  logout,
  getDevAccount,
};
