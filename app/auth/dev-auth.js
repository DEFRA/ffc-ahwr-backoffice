const {
  administrator,
  processor,
  user,
  recommender,
  authoriser,
} = require("./permissions");
const { developerName, developerUsername } = require("../config");

const devAccount = {
  name: developerName || "Developer",
  username: developerUsername || "developer@defra.gov.uk",
};

const getAuthenticationUrl = () => {
  return "/dev-auth";
};

const authenticate = async (_, cookieAuth) => {
  cookieAuth.set({
    scope: [administrator, processor, user, recommender, authoriser],
    account: devAccount,
  });
};

const refresh = async (_account, cookieAuth) => {
  cookieAuth.set({
    scope: [administrator, processor, user, recommender, authoriser],
    account: devAccount,
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
