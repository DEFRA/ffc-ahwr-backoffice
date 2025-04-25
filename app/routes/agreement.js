const joi = require("joi");
const boom = require("@hapi/boom");
const crumbCache = require("./utils/crumb-cache");
const {
  administrator,
  authoriser,
  processor,
  recommender,
  user,
} = require("../auth/permissions");
const { getApplication } = require("../api/applications");
const { formatedDateToUk } = require("../lib/display-helper");
const { getClaimSearch, setClaimSearch } = require("../session");
const { claimSearch } = require("../session/keys");
const {
  getContactHistory,
  displayContactHistory,
} = require("../api/contact-history");
const { getClaims } = require("../api/claims");
const {
  getClaimTableHeader,
  getClaimTableRows,
} = require("./models/claim-list");
const { FLAG_EMOJI } = require("./utils/ui-constants");

const pageUrl = "/agreement/{reference}/claims";
const getBackLink = (page, claimReference, returnPage) => {
  return returnPage === "view-claim"
    ? `/view-claim/${claimReference}?page=${page}`
    : `/agreements?page=${page}`;
};

module.exports = [
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

        await crumbCache.generateNewCrumb(request, h);
        const application = await getApplication(request.params.reference);
        const contactHistory = await getContactHistory(
          request.params.reference,
        );
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
            newValue: `${request.params.reference}${flaggedText}`,
            oldValue: null,
            flagged: isFlagged,
          },
          {
            field: "Agreement date",
            newValue: formatedDateToUk(application.createdAt),
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

        const applicationSummaryDetails = summaryDetails.filter(
          (row) => row.newValue,
        );

        const sortField =
          getClaimSearch(request, claimSearch.sort) ?? undefined;
        const showSBI = false;
        const dataURLPrefix = `/agreement/${request.params.reference}/`;
        const header = getClaimTableHeader(sortField, dataURLPrefix, showSBI);

        const searchText = request.params.reference;
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
        request.params.direction =
          request.params.direction !== "descending" ? "DESC" : "ASC";
        setClaimSearch(request, claimSearch.sort, request.params);
        return 1; // NOSONAR
      },
    },
  },
];
