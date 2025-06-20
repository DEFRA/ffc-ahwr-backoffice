import joi from "joi";
import boom from "@hapi/boom";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { permissions } from "../auth/permissions.js";
import { getApplication } from "../api/applications.js";
import { formattedDateToUk } from "../lib/display-helper.js";
import { getClaimSearch, setClaimSearch } from "../session/index.js";
import { sessionKeys } from "../session/keys.js";
import { getContactHistory, displayContactHistory } from "../api/contact-history.js";
import { getClaims } from "../api/claims.js";
import { getClaimTableHeader, getClaimTableRows } from "./models/claim-list.js";
import { FLAG_EMOJI } from "./utils/ui-constants.js";
import { getHerdBreakdown } from "../lib/get-herd-breakdown.js";

const { administrator, authoriser, processor, recommender, user } = permissions;
const pageUrl = "/agreement/{reference}/claims";
const getBackLink = (page, claimReference, returnPage) => {
  return returnPage === "view-claim"
    ? `/view-claim/${claimReference}?page=${page}`
    : `/agreements?page=${page}`;
};

export const agreementRoutes = [
  {
    method: "GET",
    path: pageUrl,
    options: {
      auth: {
        scope: [administrator, authoriser, processor, recommender, user],
      },
      validate: {
        params: joi.object({
          reference: joi.string(),
        }),
        query: joi.object({
          reference: joi.string(),
          page: joi.number().greater(0).default(1),
          returnPage: joi.string(),
        }),
      },
      handler: async (request, h) => {
        const { page, reference, returnPage } = request.query;
        const { reference: applicationReference } = request.params;

        await generateNewCrumb(request, h);
        const application = await getApplication(applicationReference);
        const contactHistory = await getContactHistory(applicationReference);
        const contactHistoryDetails = displayContactHistory(contactHistory);
        if (!application) {
          throw boom.badRequest();
        }

        const { organisation } = application.data;
        const isFlagged = application.flags.length > 0;
        const flaggedText = isFlagged ? ` ${FLAG_EMOJI}` : "";
        const summaryDetails = [
          {
            field: "Agreement number",
            newValue: `${applicationReference}${flaggedText}`,
            oldValue: null,
            flagged: isFlagged,
          },
          {
            field: "Agreement date",
            newValue: formattedDateToUk(application.createdAt),
            oldValue: null,
          },
          {
            field: "Agreement holder",
            newValue: organisation.farmerName,
            oldValue: contactHistoryDetails.farmerName,
          },
          {
            field: "Agreement holder email",
            newValue: organisation.email,
            oldValue: contactHistoryDetails.email,
          },
          { field: "SBI number", newValue: organisation.sbi, oldValue: null },
          {
            field: "Address",
            newValue: organisation.address,
            oldValue: contactHistoryDetails.address,
          },
          {
            field: "Business email",
            newValue: organisation.orgEmail,
            oldValue: contactHistoryDetails.orgEmail,
          },
          {
            field: "Flagged",
            newValue: application.flags.length > 0 ? "Yes" : "No",
            oldValue: null,
          },
        ];

        const applicationSummaryDetails = summaryDetails.filter((row) => row.newValue);

        const sortField = getClaimSearch(request, sessionKeys.claimSearch.sort) ?? undefined;
        const showSBI = false;
        const dataURLPrefix = `/agreement/${applicationReference}/`;
        const header = getClaimTableHeader(sortField, dataURLPrefix, showSBI);

        const searchText = applicationReference;
        const searchType = "appRef";
        const filter = undefined;
        const limit = 30;
        const offset = 0;
        const { claims, total } = await getClaims(
          searchType,
          searchText,
          filter,
          limit,
          offset,
          sortField,
          request.logger,
        );
        const claimReturnPage = "agreement";
        const rows = getClaimTableRows(claims, page, claimReturnPage, showSBI);

        return h.view("agreement", {
          backLink: getBackLink(page, reference, returnPage),
          businessName: application.data?.organisation?.name,
          applicationSummaryDetails,
          claimsTotal: total,
          header,
          rows,
          ...getHerdBreakdown(claims),
        });
      },
    },
  },
  {
    method: "GET",
    path: `${pageUrl}/sort/{field}/{direction}`,
    options: {
      auth: {
        scope: [administrator, processor, user, recommender, authoriser],
      },
      validate: {
        params: joi.object({
          reference: joi.string(),
          field: joi.string(),
          direction: joi.string(),
        }),
      },
      handler: async (request, h) => {
        request.params.direction = request.params.direction !== "descending" ? "DESC" : "ASC";
        setClaimSearch(request, sessionKeys.claimSearch.sort, request.params);
        return 1; // NOSONAR
      },
    },
  },
];
