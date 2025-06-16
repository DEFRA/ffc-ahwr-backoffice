import joi from "joi";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { updateApplicationStatus } from "../api/applications.js";
import { updateClaimStatus } from "../api/claims.js";
import { encodeErrorsForUI } from "./utils/encode-errors-for-ui.js";
import { permissions } from "../auth/permissions.js";
import { CLAIM_STATUS } from "ffc-ahwr-common-library";

const { administrator, recommender } = permissions;

export const recommendToRejectRoute = {
  method: "post",
  path: "/recommend-to-reject",
  options: {
    auth: { scope: [administrator, recommender] },
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

        const errors = encodeErrorsForUI(err.details, "#recommend-to-reject");
        const query = new URLSearchParams({
          page,
          recommendToReject: "true",
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
        await updateClaimStatus(
          reference,
          name,
          CLAIM_STATUS.RECOMMENDED_TO_REJECT,
          request.logger,
        );
      } else {
        await updateApplicationStatus(
          reference,
          name,
          CLAIM_STATUS.RECOMMENDED_TO_REJECT,
          request.logger,
        );
      }

      return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`);
    },
  },
};
