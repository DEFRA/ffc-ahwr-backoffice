const joi = require("joi");
const { getClaimSearch, setClaimSearch } = require("../session");
const { claimSearch } = require("../session/keys");
const crumbCache = require("./utils/crumb-cache");
const { displayPageSize } = require("../pagination");
const { getClaims } = require("../api/claims");
const { getPagination, getPagingData } = require("../pagination");
const checkValidSearch = require("../lib/search-validation");
const {
  getClaimTableHeader,
  getClaimTableRows,
} = require("./models/claim-list");
const {
  administrator,
  authoriser,
  processor,
  recommender,
  user,
} = require("../auth/permissions");
const mapAuth = require("../auth/map-auth");

const viewTemplate = "claims";
const currentPath = `/${viewTemplate}`;

const getViewData = async (request) => {
  const { page } = request.query;
  const returnPage = viewTemplate;
  const { limit, offset } = getPagination(page);
  const searchText = getClaimSearch(request, claimSearch.searchText);
  const sort = getClaimSearch(request, claimSearch.sort);
  const { searchType } = checkValidSearch(searchText);
  const filter = undefined;
  const { claims, total } = await getClaims(
    searchType,
    searchText,
    filter,
    limit,
    offset,
    sort,
    request.logger,
  );
  const header = getClaimTableHeader(sort);
  const rows = getClaimTableRows(claims, page, returnPage);
  const { previous, next, pages } = getPagingData(total, limit, request.query);
  const error = total === 0 ? "no claims found" : null;

  const { isAdministrator } = mapAuth(request);
  const pageHeader = isAdministrator
    ? "Claims, Agreements and Flags"
    : "Claims and Agreements";
  const showFlagsTab = isAdministrator;

  return {
    searchText,
    header,
    rows,
    previous,
    next,
    pages,
    error,
    pageHeader,
    showFlagsTab,
  };
};

module.exports = [
  {
    method: "GET",
    path: currentPath,
    options: {
      auth: {
        scope: [administrator, authoriser, processor, recommender, user],
      },
      validate: {
        query: joi.object({
          page: joi.number().greater(0).default(1),
        }),
      },
      handler: async (request, h) => {
        await crumbCache.generateNewCrumb(request, h);
        const viewData = await getViewData(request);
        return h.view("claims", viewData);
      },
    },
  },
  {
    method: "GET",
    path: `${currentPath}/sort/{field}/{direction}`,
    options: {
      auth: {
        scope: [administrator, processor, user, recommender, authoriser],
      },
      validate: {
        params: joi.object({
          field: joi.string(),
          direction: joi.string(),
        }),
      },
      handler: async (request) => {
        request.params.direction =
          request.params.direction !== "descending" ? "DESC" : "ASC";
        setClaimSearch(request, claimSearch.sort, request.params);
        return 1; // NOSONAR
      },
    },
  },
  {
    method: "POST",
    path: `${currentPath}`,
    options: {
      auth: {
        scope: [administrator, processor, user, recommender, authoriser],
      },
      validate: {
        query: joi.object({
          page: joi.number().greater(0).default(1),
          limit: joi.number().greater(0).default(displayPageSize),
        }),
      },
      handler: async (request, h) => {
        try {
          setClaimSearch(
            request,
            claimSearch.searchText,
            request.payload?.searchText,
          );
          const viewData = await getViewData(request);
          return h.view(viewTemplate, viewData);
        } catch (err) {
          request.logger.setBindings({ err });
          return h
            .view(viewTemplate, { ...request.payload, error: err })
            .code(400)
            .takeover();
        }
      },
    },
  },
];
