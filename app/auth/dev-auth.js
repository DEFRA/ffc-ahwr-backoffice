import { permissions } from "./permissions.js";

const { administrator, processor, user, recommender, authoriser } = permissions;

const getDevAccount = (userId) => {
  if (userId) {
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

export const authenticate = async (userId, auth, cookieAuth) => {
  const roles = [administrator, processor, user, recommender, authoriser];
  const account = getDevAccount(userId);
  const sessionId = await auth.createSession(account, roles);
  cookieAuth.set({ id: sessionId });
  return [account.username, roles];
};

export const logout = async () => {};
