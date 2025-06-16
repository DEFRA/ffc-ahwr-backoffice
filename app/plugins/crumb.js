import { config } from "../config/index.js";
import crumb from "@hapi/crumb";

const { cookie: cookieConfig } = config;

export const crumbPlugin = {
  plugin: crumb,
  options: {
    cookieOptions: {
      isSecure: cookieConfig.isSecure,
    },
  },
};
