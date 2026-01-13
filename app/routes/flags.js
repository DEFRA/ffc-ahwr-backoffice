import Joi from "joi";
import { permissions } from "../auth/permissions.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { createFlagsTableData } from "./models/flags-list.js";
import { mapAuth } from "../auth/map-auth.js";

const { administrator, processor, user, recommender, authoriser } = permissions;

const getFlagsHandler = {
  method: "GET",
  path: "/flags",
  options: {
    auth: {
      scope: [administrator, processor, user, recommender, authoriser],
    },
    validate: {
      query: Joi.object({
        createFlag: Joi.bool(),
        deleteFlag: Joi.string(),
        errors: Joi.string(),
      }),
    },
    handler: async (request, h) => {
      const { createFlag, deleteFlag, errors } = request.query;
      await generateNewCrumb(request, h);

      const parsedErrors = errors ? JSON.parse(Buffer.from(errors, "base64").toString("utf8")) : [];

      const { isAdministrator } = mapAuth(request);

      return h.view("flags", {
        ...(await createFlagsTableData({
          logger: request.logger,
          flagIdToDelete: deleteFlag,
          createFlag,
          isAdmin: isAdministrator,
        })),
        errors: parsedErrors,
        isAdmin: isAdministrator,
      });
    },
  },
};

const deleteFlagHandler = {
  method: "POST",
  path: "/flags/{flagId}/delete",
  options: {
    auth: {
      scope: [administrator],
    },
    handler: async (request, h) => {
      return h.redirect("/flags").takeover();
    },
  },
};

const createFlagHandler = {
  method: "POST",
  path: "/flags/create",
  options: {
    auth: {
      scope: [administrator],
    },
    handler: async (request, h) => {
      return h.redirect("/flags").takeover();
    },
  },
};

export const flagsRoutes = [getFlagsHandler, deleteFlagHandler, createFlagHandler];
