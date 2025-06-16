import Joi from "joi";
import { permissions } from "../auth/permissions.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { createFlagsTableData } from "./models/flags-list.js";
import { deleteFlag, createFlag } from "../api/flags.js";
import { encodeErrorsForUI } from "./utils/encode-errors-for-ui.js";
import { StatusCodes } from "http-status-codes";
import { mapAuth } from "../auth/map-auth.js";

const { administrator, processor, user, recommender, authoriser } = permissions;
const MIN_APPLICATION_REFERENCE_LENGTH = 14;
const MIN_NOTE_LENGTH = 1;

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
    validate: {
      params: Joi.object({
        flagId: Joi.string().required(),
      }),
      payload: Joi.object({
        deletedNote: Joi.string().min(2).required(),
      }),
      failAction: async (request, h, err) => {
        request.logger.setBindings({ err });

        const joiError = err.details[0];

        let errorMessageToBeRendered = "";

        if (joiError.message.includes("length must be at least 2 characters long")) {
          errorMessageToBeRendered = "Enter a note of at least 2 characters in length";
        } else {
          errorMessageToBeRendered = "Enter a note to explain the reason for removing this flag";
        }

        const formattedError = {
          ...joiError,
          message: errorMessageToBeRendered,
        };

        const errors = encodeErrorsForUI([formattedError], "#deletedNote");
        const query = new URLSearchParams({
          deleteFlag: request.params.flagId,
          errors,
        });

        return h.redirect(`/flags?${query.toString()}`).takeover();
      },
    },
    handler: async (request, h) => {
      try {
        const { flagId } = request.params;
        const { deletedNote } = request.payload;
        const { name: userName } = request.auth.credentials.account;
        await deleteFlag({ flagId, deletedNote }, userName, request.logger);

        return h.redirect("/flags").takeover();
      } catch (err) {
        return h
          .view("flags", { ...request.payload, error: err })
          .code(StatusCodes.BAD_REQUEST)
          .takeover();
      }
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
    validate: {
      payload: Joi.object({
        appRef: Joi.string().min(MIN_APPLICATION_REFERENCE_LENGTH).required(),
        note: Joi.string().min(MIN_NOTE_LENGTH).required(),
        appliesToMh: Joi.string().valid("yes", "no").required(),
      }),
      failAction: async (request, h, err) => {
        request.logger.setBindings({ err });

        const formattedErrors = err.details
          .map((error) => {
            if (error.message.includes("note")) {
              return {
                ...error,
                message: "Enter a note to explain the reason for creating the flag.",
              };
            }

            if (error.message.includes("appRef")) {
              return {
                ...error,
                message: "Enter a valid agreement reference.",
              };
            }

            if (error.message.includes("appliesToMh")) {
              return {
                ...error,
                message: "Select if the flag is because the user declined multiple herds T&C's.",
              };
            }

            return null;
          })
          .filter((error) => error !== null);

        const errors = encodeErrorsForUI(formattedErrors, "#");
        const query = new URLSearchParams({
          createFlag: "true",
          errors,
        });

        return h.redirect(`/flags?${query.toString()}`).takeover();
      },
    },
    handler: async (request, h) => {
      try {
        const { name: userName } = request.auth.credentials.account;
        const { note, appliesToMh, appRef } = request.payload;
        const payload = {
          user: userName,
          note: note.trim(),
          appliesToMh: appliesToMh === "yes",
        };

        const { res } = await createFlag(payload, appRef.trim(), request.logger);

        if (res.statusCode === StatusCodes.NO_CONTENT) {
          let error = new Error("Flag already exists.");
          error = {
            data: {
              res: {
                statusCode: StatusCodes.NO_CONTENT,
              },
            },
            message: error.message,
          };
          throw error;
        }

        return h.redirect("/flags").takeover();
      } catch (err) {
        request.logger.setBindings({ err });
        let formattedErrors = [];

        if (err.data.res.statusCode === StatusCodes.NOT_FOUND) {
          formattedErrors = [
            {
              message: "Agreement reference does not exist.",
              path: [],
              type: "string.empty",
              context: {
                key: "appRef",
              },
            },
          ];
        }

        if (err.data.res.statusCode === StatusCodes.NO_CONTENT) {
          formattedErrors = [
            {
              message: `Flag not created - agreement flag with the same "Flag applies to multiple herds T&C's" value already exists.`,
              path: [],
              type: "string.empty",
              context: {
                key: "appRef",
              },
            },
          ];
        }

        if (formattedErrors.length) {
          const errors = encodeErrorsForUI(formattedErrors, "#agreement-reference");
          const query = new URLSearchParams({
            createFlag: "true",
            errors,
          });

          return h.redirect(`/flags?${query.toString()}`).takeover();
        }

        return h
          .view("flags", await createFlagsTableData({ logger: request.logger }))
          .code(StatusCodes.BAD_REQUEST)
          .takeover();
      }
    },
  },
};

export const flagsRoutes = [getFlagsHandler, deleteFlagHandler, createFlagHandler];
