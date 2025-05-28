const joi = require("joi");
const { administrator } = require("../auth/permissions");
const { encodeErrorsForUI } = require("./utils/encode-errors-for-ui");
const crumbCache = require("./utils/crumb-cache");
const { updateClaimData } = require("../api/claims");
const { updateApplicationData } = require("../api/applications");

const panelIdGivenFormName = (formName) => {
  if (formName === "updateVetsName") {
    return "#update-vets-name";
  }

  if (formName === "updateDateOfVisit") {
    return "#update-date-of-visit";
  }

  return "#update-vet-rcvs-number";
};

module.exports = [
  {
    method: "post",
    path: "/claims/data",
    options: {
      auth: { scope: [administrator] },
      validate: {
        payload: joi
          .object({
            claimOrAgreement: joi.string().valid("claim", "agreement").required(),
            vetsName: joi
              .alternatives()
              .conditional("form", {
                is: "updateVetsName",
                then: joi.string().required(),
              })
              .messages({
                "any.required": "Enter vet's name",
                "string.empty": "Enter vet's name",
              }),
            day: joi
              .alternatives()
              .conditional("form", {
                is: "updateDateOfVisit",
                then: joi.number().min(1).max(31).required(),
              })
              .messages({
                "number.base": "Enter day",
                "number.min": "Enter valid day",
                "number.max": "Enter valid day",
              }),
            month: joi
              .alternatives()
              .conditional("form", {
                is: "updateDateOfVisit",
                then: joi.number().min(1).max(12).required(),
              })
              .messages({
                "number.base": "Enter month",
                "number.min": "Enter valid month",
                "number.max": "Enter valid month",
              }),
            year: joi
              .alternatives()
              .conditional("form", {
                is: "updateDateOfVisit",
                then: joi.number().min(2020).max(2030).required(),
              })
              .messages({
                "number.base": "Enter year",
                "number.min": "Enter valid year between 2020 and 2030",
                "number.max": "Enter valid year between 2020 and 2030",
              }),
            vetRCVSNumber: joi
              .alternatives()
              .conditional("form", {
                is: "updateVetRCVSNumber",
                then: joi
                  .string()
                  .pattern(/^\d{6}[\dX]$/i)
                  .required(),
              })
              .messages({
                "string.empty": "Enter Vet's RCVS number",
                "string.pattern.base":
                  "Vet's RCVS number should be a 7 digit number or 6 digit number ending with a letter",
              }),
            note: joi.string().required().messages({
              "any.required": "Enter note",
              "string.empty": "Enter note",
            }),
            page: joi.number().greater(0).default(1),
            form: joi
              .string()
              .required()
              .valid("updateVetsName", "updateDateOfVisit", "updateVetRCVSNumber"),
            returnPage: joi.string().optional().allow("").valid("agreement", "claims"),
            reference: joi.string().required(),
          })
          .required(),
        failAction: async (request, h, err) => {
          const { claimOrAgreement, form, page, reference, returnPage } = request.payload;

          request.logger.setBindings({ err, form });

          const panelID = panelIdGivenFormName(form);

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
            .redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`)
            .takeover();
        },
      },
      handler: async (request, h) => {
        const { name } = request.auth.credentials.account;
        const {
          claimOrAgreement,
          form,
          page,
          note,
          returnPage,
          vetsName,
          vetRCVSNumber,
          day,
          month,
          year,
          reference,
        } = request.payload;

        request.logger.setBindings({ form });

        await crumbCache.generateNewCrumb(request, h);
        const query = new URLSearchParams({ page });

        const dateOfVisit =
          day && month && year
            ? new Date(
                `${year}/${month.toString().padStart(2, 0)}/${day.toString().padStart(2, 0)}`,
              ).toISOString()
            : undefined;

        if (claimOrAgreement === "claim") {
          query.append("returnPage", returnPage);
          const claimData = {
            vetsName,
            vetRCVSNumber,
            dateOfVisit,
          };

          await updateClaimData(reference, claimData, note, name, request.logger);
        }

        if (claimOrAgreement === "agreement") {
          const agreementData = {
            vetName: vetsName,
            vetRcvs: vetRCVSNumber,
            visitDate: dateOfVisit,
          };
          await updateApplicationData(reference, agreementData, note, name, request.logger);
        }

        return h.redirect(`/view-${claimOrAgreement}/${reference}?${query.toString()}`);
      },
    },
  },
];
