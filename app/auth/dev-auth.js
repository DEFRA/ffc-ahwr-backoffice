import { permissions } from "./permissions.js";

const { administrator, processor, user, recommender, authoriser } = permissions;

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

export const getAuthenticationUrl = (userId) => {
  if (userId) {
    return `/dev-auth?userId=${userId}`;
  }

  return "/dev-auth";
};

export const authenticate = async (userId, cookieAuth) => {
  const roles = [administrator, processor, user, recommender, authoriser];
  const account = getDevAccount(userId);
  cookieAuth.set({
    scope: roles,
    account,
  });
  return [account.username, roles];
};

export const refresh = async (_account, cookieAuth) => {
  cookieAuth.set({
    scope: [administrator, processor, user, recommender, authoriser],
    account: getDevAccount(cachedUserId),
  });

  return [administrator, processor, user, recommender, authoriser];
};

export const logout = async () => {};
