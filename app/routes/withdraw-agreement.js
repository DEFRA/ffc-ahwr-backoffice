import joi from "joi";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { permissions } from "../auth/permissions.js";
import { CLAIM_STATUS } from "ffc-ahwr-common-library";
import { updateApplicationStatus } from "../api/applications.js";
import { preSubmissionHandler } from "./utils/pre-submission-handler.js";
import { encodeErrorsForUI } from "./utils/encode-errors-for-ui.js";

const { administrator, authoriser } = permissions;

export const withdrawAgreementRoute = {
  method: "post",
  path: "/withdraw-agreement",
  options: {
    pre: [{ method: preSubmissionHandler }],
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

        return h.redirect(`/view-agreement/${reference}?${query.toString()}`).takeover();
      },
    },
    handler: async (request, h) => {
      const { page, reference } = request.payload;
      const { user } = request.auth.credentials.account;

      await updateApplicationStatus(reference, user, CLAIM_STATUS.WITHDRAWN, request.logger);
      await generateNewCrumb(request, h);
      const query = new URLSearchParams({ page });

      return h.redirect(`/view-agreement/${reference}?${query.toString()}`);
    },
  },
};
