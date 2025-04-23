const { serviceUri } = require("../../config");
const { getStyleClassByStatus } = require("../../constants/status");
const {
  formatTypeOfVisit,
  formatSpecies,
  formatedDateToUk,
  upperFirstLetter,
} = require("../../lib/display-helper");
const { FLAG_EMOJI } = require("../utils/ui-constants");

const getClaimTableHeader = (sortField, dataURLPrefix = "", showSBI = true) => {
  const direction =
    sortField && sortField.direction === "DESC" ? "descending" : "ascending";

  return [
    {
      text: "Claim number",
      attributes: {
        "aria-sort":
          sortField && sortField.field === "claim number" ? direction : "none",
        "data-url": `${dataURLPrefix}claims/sort/claim number`,
      },
    },
    {
      html: `<span aria-hidden="true" role="img">Flagged ${FLAG_EMOJI}</span>`,
    },
    {
      text: "Type of visit",
      attributes: {
        "aria-sort":
          sortField && sortField.field === "type of visit" ? direction : "none",
        "data-url": "claims/sort/type of visit",
      },
    },
    showSBI && {
      text: "SBI number",
      attributes: {
        "aria-sort":
          sortField && sortField.field === "SBI" ? direction : "none",
        "data-url": "/claims/sort/SBI",
      },
      format: "numeric",
    },
    {
      text: "Species",
      attributes: {
        "aria-sort":
          sortField && sortField.field === "species" ? direction : "none",
        "data-url": "claims/sort/species",
      },
    },
    {
      text: "Claim date",
      attributes: {
        "aria-sort":
          sortField && sortField.field === "claim date" ? direction : "none",
        "data-url": "claims/sort/claim date",
      },
      format: "date",
    },
    {
      text: "Status",
      attributes: {
        "aria-sort":
          sortField && sortField.field === "status" ? direction : "none",
        "data-url": "claims/sort/status",
      },
    },
    {
      text: "Details",
    },
  ].filter(Boolean);
};

const getClaimTableRows = (claims, page, returnPage, showSBI = true) => 
  claims.map((claim) => {
    const row = [
      {
        text: claim.reference,
        attributes: {
          "data-sort-value": claim.reference,
        },
      },
      {
        html: claim.flags.length ? `<span aria-hidden="true" role="img">Yes ${FLAG_EMOJI}</span>` : ''
      },
      {
        text: formatTypeOfVisit(claim.type),
        attributes: {
          "data-sort-value": claim.type,
        },
      },
      showSBI && {
        text: claim.application.data?.organisation?.sbi,
        format: "numeric",
        attributes: {
          "data-sort-value": claim.application.data?.organisation?.sbi,
        },
      },
      {
        text: formatSpecies(claim.data?.typeOfLivestock),
        attributes: {
          "data-sort-value": claim.data?.typeOfLivestock,
        },
      },
      {
        text: formatedDateToUk(claim.createdAt),
        format: "date",
        attributes: {
          "data-sort-value": claim.createdAt,
        },
      },
      {
        html: `<span class="app-long-tag"><span class="govuk-tag ${getStyleClassByStatus(claim.status.status)}">${upperFirstLetter(claim.status.status.toLowerCase())}</span></span>`,
        attributes: {
          "data-sort-value": `${claim.status.status}`,
        },
      },
      {
        html: `<a href="${serviceUri}/view-claim/${claim.reference}?page=${page}&returnPage=${returnPage}">View claim</a>`,
      },
    ];

    if (claim.flags.length) {
      return row.map((rowItem) => ({
        ...rowItem,
        classes: 'flagged-item'
      }))
    }
  }
  );

module.exports = { getClaimTableHeader, getClaimTableRows };
