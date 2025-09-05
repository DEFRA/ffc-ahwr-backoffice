import Joi from "joi";
import { permissions } from "../auth/permissions.js";
import { config } from "../config/index.js";
import { setAppSearch, getAppSearch } from "../session/index.js";
import { sessionKeys } from "../session/keys.js";
import { viewModel } from "./models/application-list.js";
import { searchValidation } from "../lib/search-validation.js";
import { generateNewCrumb } from "./utils/crumb-cache.js";
import { StatusCodes } from "http-status-codes";

const { administrator, processor, user, recommender, authoriser } = permissions;
const { displayPageSize } = config;
const viewTemplate = "agreements";
const currentPath = `/${viewTemplate}`;

export const agreementsRoutes = [
  {
    method: "GET",
    path: currentPath,
    options: {
      auth: {
        scope: [administrator, processor, user, recommender, authoriser],
      },
      validate: {
        query: Joi.object({
          page: Joi.number().greater(0).default(1),
          limit: Joi.number().greater(0).default(displayPageSize),
        }),
      },
      handler: async (request, h) => {
        await generateNewCrumb(request, h);
        const viewModelDetails = await viewModel(request);
        return h.view(viewTemplate, viewModelDetails);
      },
    },
  },
  {
    method: "GET",
    path: `${currentPath}/clear`,
    options: {
      auth: {
        scope: [administrator, processor, user, recommender, authoriser],
      },
      handler: async (request, h) => {
        setAppSearch(request, sessionKeys.appSearch.filterStatus, []);
        const viewModelDetails = await viewModel(request);
        return h.view(viewTemplate, viewModelDetails);
      },
    },
  },
  {
    method: "GET",
    path: `${currentPath}/remove/{status}`,
    options: {
      auth: {
        scope: [administrator, processor, user, recommender, authoriser],
      },
      validate: {
        params: Joi.object({
          status: Joi.string(),
        }),
      },
      handler: async (request, h) => {
        let filterStatus = getAppSearch(request, sessionKeys.appSearch.filterStatus);
        filterStatus = filterStatus.filter((s) => s !== request.params.status);
        setAppSearch(request, sessionKeys.appSearch.filterStatus, filterStatus);
        const viewModelDetails = await viewModel(request);
        return h.view(viewTemplate, viewModelDetails);
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
        query: Joi.object({
          page: Joi.number().greater(0).default(1),
          limit: Joi.number().greater(0).default(displayPageSize),
        }),
      },
      handler: async (request, h) => {
        try {
          let filterStatus = [];
          // Is Search Button Clicked
          if (!request.payload.submit) {
            filterStatus = request.payload?.status ?? [];
            filterStatus = Array.isArray(filterStatus) ? filterStatus : [filterStatus];
          }

          setAppSearch(request, sessionKeys.appSearch.filterStatus, filterStatus);
          const { searchText, searchType } = searchValidation(request.payload.searchText);
          setAppSearch(request, sessionKeys.appSearch.searchText, searchText ?? "");
          setAppSearch(request, sessionKeys.appSearch.searchType, searchType ?? "");
          const viewModelDetails = await viewModel(request, 1);
          return h.view(viewTemplate, viewModelDetails);
        } catch (err) {
          return h
            .view(viewTemplate, { ...request.payload, error: err })
            .code(StatusCodes.BAD_REQUEST)
            .takeover();
        }
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
        params: Joi.object({
          field: Joi.string(),
          direction: Joi.string(),
        }),
      },
      handler: async (request, _h) => {
        request.params.direction = request.params.direction !== "descending" ? "DESC" : "ASC";
        setAppSearch(request, sessionKeys.appSearch.sort, request.params);
        return 1; // NOSONAR
      },
    },
  },
];
