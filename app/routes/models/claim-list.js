import { getStyleClassByStatus } from "../../constants/status.js";
import {
  upperFirstLetter,
  formatTypeOfVisit,
  formatSpecies,
  formattedDateToUk,
} from "../../lib/display-helper.js";
import { FLAG_EMOJI } from "../utils/ui-constants.js";
import { config } from "../../config/index.js";

const { serviceUri } = config;

const respText = "responsive-text";
const col6RespText = `col-6 ${respText}`;

export const getClaimTableHeader = (sortField, dataURLPrefix = "", showSBI = true) => {
  const direction = sortField && sortField.direction === "DESC" ? "descending" : "ascending";
  const sort = sortField ? sortField.field : "";

  return [
    {
      text: "Claim number & Type",
      attributes: {
        "aria-sort": sort === "claim number" ? direction : "none",
        "data-url": `${dataURLPrefix}claims/sort/claim number`,
      },
      classes: `col-12 ${respText}`,
    },
    {
      html: `<span>Flagged ${FLAG_EMOJI}</span>`,
      classes: col6RespText,
    },
    {
      text: "Species",
      attributes: {
        "aria-sort": sort === "species" ? direction : "none",
        "data-url": "claims/sort/species",
      },
      classes: col6RespText,
    },
    {
      text: "Herd name",
      classes: `col-25 ${respText}`,
    },
    {
      text: "Herd CPH",
      classes: col6RespText,
    },
    showSBI && {
      text: "SBI number",
      attributes: {
        "aria-sort": sort === "SBI" ? direction : "none",
        "data-url": "/claims/sort/SBI",
      },
      format: "numeric",
      classes: `col-6 align-left ${respText}`,
    },
    {
      text: "Claim date",
      attributes: {
        "aria-sort": sort === "claim date" ? direction : "none",
        "data-url": "claims/sort/claim date",
      },
      format: "date",
      classes: `col-6 align-left ${respText}`,
    },
    {
      text: "Status",
      attributes: {
        "aria-sort": sort === "status" ? direction : "none",
        "data-url": "claims/sort/status",
      },
      classes: col6RespText,
    },
  ].filter(Boolean);
};

export const getClaimTableRows = (claims, page, returnPage, showSBI = true) =>
  claims.map((claim) => {
    const row = [
      {
        html: `<div>
                <a class="govuk-!-margin-0 ${respText}" href="${serviceUri}/view-claim/${claim.reference}?page=${page}&returnPage=${returnPage}">${claim.reference}</a>
                <p class="govuk-!-margin-0 ${respText}">${formatTypeOfVisit(claim.type)}</p>
              </div>`,
      },
      {
        html: claim.flags.length ? `<span>Yes ${FLAG_EMOJI}</span>` : "",
        classes: respText,
      },
      {
        text: formatSpecies(claim.data?.typeOfLivestock),
        attributes: {
          "data-sort-value": claim.data?.typeOfLivestock,
        },
        classes: respText,
      },
      {
        text:
          claim.herd?.herdName ??
          (claim.data.typeOfLivestock === "sheep" ? "Unnamed flock" : "Unnamed herd"),
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
              classes: `${respText} align-left`,
            },
          ]
        : []),
      {
        text: formattedDateToUk(claim.createdAt),
        format: "date",
        attributes: {
          "data-sort-value": claim.createdAt,
        },
        classes: `${respText} align-left`,
      },
      {
        html: `<span class="app-long-tag"><span class="govuk-tag ${respText} ${getStyleClassByStatus(claim.status.status)}">${upperFirstLetter(claim.status.status.toLowerCase())}</span></span>`,
        attributes: {
          "data-sort-value": `${claim.status.status}`,
        },
      },
    ];

    if (claim.flags.length) {
      return row.map((rowItem) => ({
        ...rowItem,
        classes: rowItem?.classes ? `${rowItem.classes} flagged-item`: "flagged-item",
      }));
    }

    return row;
  });
