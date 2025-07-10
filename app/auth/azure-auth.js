import { config } from "../config/index.js";
import { ConfidentialClientApplication, LogLevel } from "@azure/msal-node";

const msalLogging = config.isProd
  ? {}
  : {
      loggerCallback(_loglevel, message, _containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose,
    };

let msalClientApplication;

export const init = () => {
  msalClientApplication = new ConfidentialClientApplication({
    auth: config.auth,
    system: { loggerOptions: msalLogging },
  });
};

export const getAuthenticationUrl = () => {
  const authCodeUrlParameters = {
    prompt: "select_account", // Force the MS account select dialog
    redirectUri: config.auth.redirectUrl,
  };

  return msalClientApplication.getAuthCodeUrl(authCodeUrlParameters);
};

export const authenticate = async (redirectCode, cookieAuth) => {
  console.log("Acquiring token");
  const token = await msalClientApplication.acquireTokenByCode({
    code: redirectCode,
    redirectUri: config.auth.redirectUrl,
  });
  console.log(`got that token... ${JSON.stringify(token)}`);

  cookieAuth.set({
    scope: token.idTokenClaims.roles,
    account: token.account,
  });
};

export const refresh = async (account, cookieAuth) => {
  console.log("Refreshing token for account:", account.username);
  const token = await msalClientApplication.acquireTokenSilent({
    account,
    forceRefresh: true,
  });

  console.log(`got that token... ${token}`);

  cookieAuth.set({
    scope: token.idTokenClaims.roles,
    account: token.account,
  });

  return token.idTokenClaims.roles;
};

export const logout = async (account) => {
  try {
    await msalClientApplication.getTokenCache().removeAccount(account);
  } catch (err) {
    console.error("Unable to end session", err);
  }
};
