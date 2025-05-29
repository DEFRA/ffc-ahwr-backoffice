const joi = require("joi");
const { updateApplicationStatus } = require("../api/applications");
const { updateClaimStatus } = require("../api/claims");
const preDoubleSubmitHandler = require("./utils/pre-submission-handler");
const crumbCache = require("./utils/crumb-cache");
const { administrator, recommender, authoriser } = require("../auth/permissions");
const { inCheck } = require("../constants/application-status");
const { encodeErrorsForUI } = require("./utils/encode-errors-for-ui");

module.exports = {
  method: "post",
  path: "/move-to-in-check",
  options: {
    auth: { scope: [administrator, recommender, authoriser] },
    pre: [{ method: preDoubleSubmitHandler }],
    validate: {
      payload: joi.object({
        claimOrAgreement: joi.string().valid("claim", "agreement").required(),
        confirm: joi
          .array()
          .items(
            joi.string().valid("recommendToMoveOnHoldClaim").required(),
            joi.string().valid("updateIssuesLog").required(),
          )
          .required()
          .messages({
            "any.required": "Select all checkboxes",
            "array.base": "Select all checkboxes",
          }),
        reference: joi.string().valid().required(),
        page: joi.number().greater(0).default(1),
        returnPage: joi.string().allow("").optional(),
      }),
      failAction: async (request, h, err) => {
        const { claimOrAgreement, page, reference, returnPage } = request.payload;

        request.logger.setBindings({ err, reference });

        const errors = encodeErrorsForUI(err.details, "#move-to-in-check");
        const query = new URLSearchParams({
          page,
          moveToInCheck: "true",
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

      await crumbCache.generateNewCrumb(request, h);
      const query = new URLSearchParams({ page });

      if (claimOrAgreement === "claim") {
        query.append("returnPage", returnPage);
        await updateClaimStatus(reference, name, inCheck, request.logger);
      } else {
        await updateApplicationStatus(reference, name, inCheck, request.logger);
      }

      return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`);
    },
  },
};
