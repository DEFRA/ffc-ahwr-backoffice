const Joi = require("joi");
const { administrator } = require("../auth/permissions");
const crumbCache = require("./utils/crumb-cache");
const { createFlagsTableData } = require("./models/flags-list");
const { deleteFlag, createFlag } = require("../api/flags");
const { encodeErrorsForUI } = require("./utils/encode-errors-for-ui");

const getFlagsHandler = {
  method: "GET",
  path: "/flags",
  options: {
    auth: {
      scope: [administrator],
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
      await crumbCache.generateNewCrumb(request, h);

      const parsedErrors = errors
        ? JSON.parse(Buffer.from(errors, "base64").toString("utf8"))
        : [];

      return h.view("flags", {
        ...(await createFlagsTableData(request.logger, deleteFlag, createFlag)),
        errors: parsedErrors,
      }); // NOSONAR
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
    },
    handler: async (request, h) => {
      try {
        const { flagId } = request.params;
        const { name: user } = request.auth.credentials.account;
        await deleteFlag(flagId, user, request.logger);

        return h.view("flags", await createFlagsTableData(request.logger)); // NOSONAR
      } catch (err) {
        return h
          .view("flags", { ...request.payload, error: err })
          .code(400)
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
        appRef: Joi.string().min(14).required(),
        note: Joi.string().min(1).required(),
        appliesToMh: Joi.string().valid("yes", "no").required(),
      }),
      failAction: async (request, h, err) => {
        request.logger.setBindings({ err });

        const formattedErrors = err.details
          .map((error) => {
            if (error.message.includes("note")) {
              return {
                ...error,
                message:
                  "Enter a note to explain the reason for creating the flag.",
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
                message:
                  "Select if the flag is because the user declined Multiple Herds T&C's.",
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
        const { name: user } = request.auth.credentials.account;
        const { note, appliesToMh, appRef } = request.payload;
        const payload = {
          user,
          note: note.trim(),
          appliesToMh: appliesToMh === "yes",
        };

        const { res } = await createFlag(
          payload,
          appRef.trim(),
          request.logger,
        );

        if (res.statusCode === 204) {
          let error = new Error("Flag already exists.");
          error = {
            data: {
              res: {
                statusCode: 204,
              },
            },
            message: error.message,
          };
          throw error;
        }

        return h.view("flags", await createFlagsTableData(request.logger)); // NOSONAR
      } catch (err) {
        request.logger.setBindings({ err });
        let formattedErrors = [];

        if (err.data.res.statusCode === 404) {
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

        if (err.data.res.statusCode === 204) {
          formattedErrors = [
            {
              message: `Flag not created - agreement flag with the same "Flag applies to MH T&C's" value already exists.`,
              path: [],
              type: "string.empty",
              context: {
                key: "appRef",
              },
            },
          ];
        }

        if (formattedErrors.length) {
          const errors = encodeErrorsForUI(
            formattedErrors,
            "#agreement-reference",
          );
          const query = new URLSearchParams({
            createFlag: "true",
            errors,
          });

          return h.redirect(`/flags?${query.toString()}`).takeover();
        }

        return h
          .view("flags", await createFlagsTableData(request.logger))
          .code(400)
          .takeover();
      }
    },
  },
};

module.exports = [getFlagsHandler, deleteFlagHandler, createFlagHandler];
