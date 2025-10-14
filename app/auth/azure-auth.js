import { config } from "../config/index.js";
import { ConfidentialClientApplication, LogLevel } from "@azure/msal-node";

let msalClientApplication;

export const init = () => {
  msalClientApplication = new ConfidentialClientApplication({
    auth: config.auth,
    system: { loggerOptions: envSpecificMsalLoggingOptions },
  });
};

export const getAuthenticationUrl = () => {
  const authCodeUrlParameters = {
    prompt: "select_account", // Force the MS account select dialog
    redirectUri: config.auth.redirectUrl,
  };

  return msalClientApplication.getAuthCodeUrl(authCodeUrlParameters);
};

export const authenticate = async (redirectCode, auth, cookieAuth) => {
  const token = await msalClientApplication.acquireTokenByCode({
    code: redirectCode,
    redirectUri: config.auth.redirectUrl,
  });

  const sessionId = auth.createSession(token.account, token.idTokenClaims.roles);
  cookieAuth.set({ id: sessionId });

  return [token.account.username, token.idTokenClaims.roles];
};

export const logout = async (account) => {
  try {
    await msalClientApplication.getTokenCache().removeAccount(account);
  } catch (err) {
    console.error("Unable to end session", err);
  }
};

const envSpecificMsalLoggingOptions = config.isProd
  ? {}
  : {
      loggerCallback(_loglevel, message, _containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose,
    };
