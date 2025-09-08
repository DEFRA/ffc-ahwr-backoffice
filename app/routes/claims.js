import joi from "joi";
import { getClaimSearch, setClaimSearch } from "../session/index.js";
import { sessionKeys } from "../session/keys.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { config } from "../config/index.js";
import { getClaims } from "../api/claims.js";
import { getPagination, getPagingData } from "../pagination.js";
import { searchValidation } from "../lib/search-validation.js";
import { getClaimTableHeader, getClaimTableRows } from "./models/claim-list.js";
import { permissions } from "../auth/permissions.js";
import { StatusCodes } from "http-status-codes";

const { administrator, authoriser, processor, recommender, user } = permissions;
const { displayPageSize } = config;
const { claimSearch } = sessionKeys;
const viewTemplate = "claims";
const currentPath = `/${viewTemplate}`;

const getViewData = async (request) => {
  const { page } = request.query;
  const returnPage = viewTemplate;
  const { limit, offset } = getPagination(page);
  const searchText = getClaimSearch(request, claimSearch.searchText);
  const sort = getClaimSearch(request, claimSearch.sort);
  const { searchType } = searchValidation(searchText);
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
  const error = total === 0 ? "No claims found." : null;

  return {
    searchText,
    header,
    rows,
    previous,
    next,
    pages,
    error,
  };
};

export const claimsRoutes = [
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
          limit: joi.number().greater(0).default(displayPageSize),
        }),
      },
      handler: async (request, h) => {
        await generateNewCrumb(request, h);
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
        request.params.direction = request.params.direction !== "descending" ? "DESC" : "ASC";
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
          setClaimSearch(request, claimSearch.searchText, request.payload?.searchText);
          const viewData = await getViewData(request);
          return h.view(viewTemplate, viewData);
        } catch (err) {
          request.logger.setBindings({ err });
          return h
            .view(viewTemplate, { ...request.payload, error: err })
            .code(StatusCodes.BAD_REQUEST)
            .takeover();
        }
      },
    },
  },
];
