const joi = require("joi");
const { administrator } = require("../auth/permissions");
const { encodeErrorsForUI } = require("./utils/encode-errors-for-ui");
const crumbCache = require("./utils/crumb-cache");
const { updateClaimData } = require("../api/claims");

module.exports = [
  {
    method: "post",
    path: "/claims/{reference}/data",
    options: {
      auth: { scope: [administrator] },
      validate: {
        params: joi.object({
          reference: joi.string(),
        }),
        payload: joi
          .object({
            claimOrAgreement: joi
              .string()
              .valid("claim", "agreement")
              .required(),
            vetsName: joi.string().optional(),
            dateOfVisit: joi.date().optional(),
            vetRCVSNumber: joi.string().optional().pattern(/^\d{6}[\dX]$/i),
            note: joi.string().required().messages({
              "any.required": "Enter note",
              "string.empty": "Enter note",
            }),
            page: joi.number().greater(0).default(1),
            form: joi
              .string()
              .required()
              .valid("updateVetsName", "updateDateOfVisit", "updateVetRCVSNumber"),
            panelID: joi.string().required(),
            returnPage: joi
              .string()
              .optional()
              .allow("")
              .valid("agreement", "claims"),
          })
          .or("vetsName", "dateOfVisit", "vetRCVSNumber")
          .required(),
        failAction: async (request, h, err) => {
          const { reference } = request.params;
          const { claimOrAgreement, form, page, panelID, returnPage } =
            request.payload;

          request.logger.setBindings({ err, form });

          const errors = encodeErrorsForUI(err.details, panelID);
          const query = new URLSearchParams({
            page,
            [form]: "true",
            errors,
          });

          if (claimOrAgreement === "claim") {
            query.append("returnPage", returnPage);
          }

          return h
            .redirect(
              `/view-${claimOrAgreement}/${reference}?${query.toString()}`,
            )
            .takeover();
        },
      },
      handler: async (request, h) => {
        const { name } = request.auth.credentials.account;
        const { reference } = request.params;
        const {
          claimOrAgreement,
          form,
          page,
          note,
          returnPage,
          vetsName,
          vetRCVSNumber,
          dateOfTesting,
        } = request.payload;

        request.logger.setBindings({ form });

        await crumbCache.generateNewCrumb(request, h);
        const query = new URLSearchParams({ page });

        const data = {
          vetsName,
          vetRCVSNumber,
          dateOfTesting,
        };
        if (claimOrAgreement === "claim") {
          query.append("returnPage", returnPage);
          await updateClaimData(reference, data, note, name, request.logger);
        }

        return h.redirect(
          `/view-${claimOrAgreement}/${reference}?${query.toString()}`,
        );
      },
    },
  },
];
