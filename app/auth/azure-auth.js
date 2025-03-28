const config = require("../config");
const msal = require("@azure/msal-node");

const msalLogging = config.isProd
  ? {}
  : {
      loggerCallback(_loglevel, message, _containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    };

const msalClientApplication = new msal.ConfidentialClientApplication({
  auth: config.auth,
  system: { loggerOptions: msalLogging },
});

const getAuthenticationUrl = () => {
  const authCodeUrlParameters = {
    prompt: "select_account", // Force the MS account select dialog
    redirectUri: config.auth.redirectUrl,
  };

  return msalClientApplication.getAuthCodeUrl(authCodeUrlParameters);
};

const authenticate = async (redirectCode, cookieAuth) => {
  const token = await msalClientApplication.acquireTokenByCode({
    code: redirectCode,
    redirectUri: config.auth.redirectUrl,
  });

  cookieAuth.set({
    scope: token.idTokenClaims.roles,
    account: token.account,
  });
};

const refresh = async (account, cookieAuth) => {
  const token = await msalClientApplication.acquireTokenSilent({
    account,
    forceRefresh: true,
  });

  cookieAuth.set({
    scope: token.idTokenClaims.roles,
    account: token.account,
  });

  return token.idTokenClaims.roles;
};

const logout = async (account) => {
  try {
    await msalClientApplication.getTokenCache().removeAccount(account);
  } catch (err) {
    console.error("Unable to end session", err);
  }
};

module.exports = {
  getAuthenticationUrl,
  authenticate,
  refresh,
  logout,
};
