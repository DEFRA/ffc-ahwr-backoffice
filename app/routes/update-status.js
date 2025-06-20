import joi from "joi";
import { permissions } from "../auth/permissions.js";
import { updateClaimStatus } from "../api/claims.js";
import { updateApplicationStatus, processApplicationClaim } from "../api/applications.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { encodeErrorsForUI } from "./utils/encode-errors-for-ui.js";
import { CLAIM_STATUS } from "ffc-ahwr-common-library";

export const updateStatusRoute = {
  method: "post",
  path: "/update-status",
  options: {
    auth: { scope: [permissions.administrator] },
    validate: {
      payload: joi.object({
        claimOrAgreement: joi.string().valid("claim", "agreement").required(),
        reference: joi.string().required(),
        status: joi.number().required(),
        note: joi.string().required().messages({
          "any.required": "Enter note",
          "string.empty": "Enter note",
        }),
        page: joi.number().greater(0).default(1),
        returnPage: joi.string().optional().allow("").valid("agreement", "claims"),
      }),
      failAction: async (request, h, err) => {
        const { claimOrAgreement, page, reference, returnPage } = request.payload;

        request.logger.setBindings({ err, reference });

        const errors = encodeErrorsForUI(err.details, "#update-status");
        const query = new URLSearchParams({
          page,
          updateStatus: "true",
          errors,
        });

        if (claimOrAgreement === "claim") {
          query.append("returnPage", returnPage);
        }

        return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`).takeover();
      },
    },
    handler: async (request, h) => {
      const { claimOrAgreement, page, reference, returnPage, status, note } = request.payload;
      const { name } = request.auth.credentials.account;

      request.logger.setBindings({ status, reference });

      await generateNewCrumb(request, h);
      const query = new URLSearchParams({ page });

      if (claimOrAgreement === "claim") {
        query.append("returnPage", returnPage);
        await updateClaimStatus(reference, name, status, request.logger, note);
      }

      if (
        claimOrAgreement === "agreement" &&
        status !== CLAIM_STATUS.READY_TO_PAY &&
        status !== CLAIM_STATUS.REJECTED
      ) {
        await updateApplicationStatus(reference, name, status, request.logger, note);
      }

      if (
        claimOrAgreement === "agreement" &&
        (status === CLAIM_STATUS.READY_TO_PAY || status === CLAIM_STATUS.REJECTED)
      ) {
        const isClaimToBePaid = status === CLAIM_STATUS.READY_TO_PAY;
        await processApplicationClaim(reference, name, isClaimToBePaid, request.logger, note);
      }

      return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`);
    },
  },
};
