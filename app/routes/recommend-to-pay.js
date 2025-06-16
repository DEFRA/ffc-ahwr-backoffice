import joi from "joi";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { preSubmissionHandler } from "./utils/pre-submission-handler.js";
import { encodeErrorsForUI } from "./utils/encode-errors-for-ui.js";
import { updateApplicationStatus } from "../api/applications.js";
import { updateClaimStatus } from "../api/claims.js";
import { CLAIM_STATUS } from "ffc-ahwr-common-library";
import { permissions } from "../auth/permissions.js";

const { administrator, recommender } = permissions;

export const recommendToPayRoute = {
  method: "post",
  path: "/recommend-to-pay",
  options: {
    auth: { scope: [administrator, recommender] },
    pre: [{ method: preSubmissionHandler }],
    validate: {
      payload: joi.object({
        claimOrAgreement: joi.string().valid("claim", "agreement").required(),
        confirm: joi
          .array()
          .items(
            joi.string().valid("checkedAgainstChecklist").required(),
            joi.string().valid("sentChecklist").required(),
          )
          .required()
          .messages({
            "any.required": "Select all checkboxes",
            "array.base": "Select all checkboxes",
          }),
        reference: joi.string().valid().required(),
        page: joi.number().greater(0).default(1),
        returnPage: joi.string().optional().allow("").valid("agreement", "claims"),
      }),
      failAction: async (request, h, err) => {
        const { claimOrAgreement, page, reference, returnPage } = request.payload;
        request.logger.setBindings({ err, reference });

        const errors = encodeErrorsForUI(err.details, "#recommend-to-pay");
        const query = new URLSearchParams({
          page,
          recommendToPay: "true",
          errors,
        });

        if (claimOrAgreement === "claim") {
          query.append("returnPage", returnPage);
        }

        return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`).takeover();
      },
    },
    handler: async (request, h) => {
      const { claimOrAgreement, page, reference, returnPage } = request.payload;
      const { name } = request.auth.credentials.account;

      request.logger.setBindings({ reference });

      await generateNewCrumb(request, h);
      const query = new URLSearchParams({ page });

      if (claimOrAgreement === "claim") {
        query.append("returnPage", returnPage);
        await updateClaimStatus(reference, name, CLAIM_STATUS.RECOMMENDED_TO_PAY, request.logger);
      } else {
        await updateApplicationStatus(
          reference,
          name,
          CLAIM_STATUS.RECOMMENDED_TO_PAY,
          request.logger,
        );
      }

      return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`);
    },
  },
};
