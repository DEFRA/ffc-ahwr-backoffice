const { serviceUri } = require("../../config");
const { getStyleClassByStatus } = require("../../constants/status");
const {
  formatTypeOfVisit,
  formatSpecies,
  formatedDateToUk,
  upperFirstLetter,
} = require("../../lib/display-helper");
const { FLAG_EMOJI } = require("../utils/ui-constants");

const respText = "responsive-text";
const col6RespText = `col-6 ${respText}`;

const getClaimTableHeader = (sortField, dataURLPrefix = "", showSBI = true) => {
  const direction =
    sortField && sortField.direction === "DESC" ? "descending" : "ascending";

  return [
    {
      text: "Claim number & Type",
      attributes: {
        "aria-sort":
          sortField && sortField.field === "claim number" ? direction : "none",
        "data-url": `${dataURLPrefix}claims/sort/claim number`,
      },
      classes: "col-12 responsive-text",
    },
    {
      html: `<span>Flagged ${FLAG_EMOJI}</span>`,
      classes: col6RespText,
    },
    {
      text: "Species",
      attributes: {
        "aria-sort":
          sortField && sortField.field === "species" ? direction : "none",
        "data-url": "claims/sort/species",
      },
      classes: col6RespText,
    },
    {
      text: "Herd name",
      classes: "col-25 responsive-text",
    },
    {
      text: "Herd CPH",
      classes: col6RespText,
    },
    showSBI && {
      text: "SBI number",
      attributes: {
        "aria-sort":
          sortField && sortField.field === "SBI" ? direction : "none",
        "data-url": "/claims/sort/SBI",
      },
      format: "numeric",
      classes: "col-6 align-left responsive-text",
    },
    {
      text: "Claim date",
      attributes: {
        "aria-sort":
          sortField && sortField.field === "claim date" ? direction : "none",
        "data-url": "claims/sort/claim date",
      },
      format: "date",
      classes: "col-6 align-left responsive-text",
    },
    {
      text: "Status",
      attributes: {
        "aria-sort":
          sortField && sortField.field === "status" ? direction : "none",
        "data-url": "claims/sort/status",
      },
      classes: col6RespText,
    },
  ].filter(Boolean);
};

const getClaimTableRows = (claims, page, returnPage, showSBI = true) =>
  claims.map((claim) => {
    const row = [
      {
        html: `<div>
                <a class="govuk-!-margin-0 responsive-text" href="${serviceUri}/view-claim/${claim.reference}?page=${page}&returnPage=${returnPage}">${claim.reference}</a>
                <p class="govuk-!-margin-0 responsive-text">${formatTypeOfVisit(claim.type)}</p>
              </div>`,
      },
      {
        html: claim.flags.length ? `<span>Yes ${FLAG_EMOJI}</span>` : "",
        classes: "reponsive-text",
      },
      {
        text: formatSpecies(claim.data?.typeOfLivestock),
        attributes: {
          "data-sort-value": claim.data?.typeOfLivestock,
        },
        classes: respText,
      },
      {
        text: claim.herd?.herdName || "Unnamed herd",
        classes: respText,
      },
      {
        text: claim.herd?.cph || "-",
        classes: respText,
      },
      ...(showSBI
        ? [
            {
              text: claim.application.data?.organisation?.sbi,
              format: "numeric",
              attributes: {
                "data-sort-value": claim.application.data?.organisation?.sbi,
              },
              classes: "responsive-text align-left",
            },
          ]
        : []),
      {
        text: formatedDateToUk(claim.createdAt),
        format: "date",
        attributes: {
          "data-sort-value": claim.createdAt,
        },
        classes: "responsive-text align-left",
      },
      {
        html: `<span class="app-long-tag"><span class="govuk-tag responsive-text ${getStyleClassByStatus(claim.status.status)}">${upperFirstLetter(claim.status.status.toLowerCase())}</span></span>`,
        attributes: {
          "data-sort-value": `${claim.status.status}`,
        },
      },
    ];

    if (claim.flags.length) {
      return row.map((rowItem) => ({
        ...rowItem,
        classes: "flagged-item",
      }));
    }

    return row;
  });

module.exports = { getClaimTableHeader, getClaimTableRows };
