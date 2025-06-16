import * as devAuth from "../auth/dev-auth.js";
import * as realAuth from "../auth/azure-auth.js";
import { config } from "../config/index.js";
import { mapAuth } from "./map-auth.js";

const getAuth = () => {
  if (config.auth.enabled) {
    return realAuth;
  }

  return devAuth;
};

export const auth = {
  ...getAuth(),
  mapAuth,
};
