const joi = require("joi");
const crumbCache = require("./utils/crumb-cache");
const { administrator, authoriser } = require("../auth/permissions");
const { updateApplicationStatus } = require("../api/applications");
const { withdrawn } = require("../constants/application-status");
const preDoubleSubmitHandler = require("./utils/pre-submission-handler");
const { encodeErrorsForUI } = require("./utils/encode-errors-for-ui");

module.exports = {
  method: "post",
  path: "/withdraw-agreement",
  options: {
    pre: [{ method: preDoubleSubmitHandler }],
    auth: { scope: [administrator, authoriser] },
    validate: {
      payload: joi.object({
        confirm: joi
          .array()
          .items(
            joi.string().valid("SentCopyOfRequest").required(),
            joi.string().valid("attachedCopyOfCustomersRecord").required(),
            joi.string().valid("receivedCopyOfCustomersRequest").required(),
          )
          .required()
          .messages({
            "any.required": "Select all checkboxes",
            "array.base": "Select all checkboxes",
          }),
        reference: joi.string().required(),
        page: joi.number().greater(0).default(1),
      }),
      failAction: async (request, h, err) => {
        const { page, reference } = request.payload;

        const errors = encodeErrorsForUI(err.details, "#withdraw");
        const query = new URLSearchParams({ page, withdraw: "true", errors });

        return h
          .redirect(`/view-agreement/${reference}?${query.toString()}`)
          .takeover();
      },
    },
    handler: async (request, h) => {
      const { page, reference } = request.payload;
      const { user } = request.auth.credentials.account;

      await updateApplicationStatus(reference, user, withdrawn, request.logger);
      await crumbCache.generateNewCrumb(request, h);
      const query = new URLSearchParams({ page });

      return h.redirect(`/view-agreement/${reference}?${query.toString()}`);
    },
  },
};
