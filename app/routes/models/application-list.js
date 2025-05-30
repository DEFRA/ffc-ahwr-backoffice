const { getApplications } = require("../../api/applications");
const { getPagination, getPagingData } = require("../../pagination");
const { getAppSearch } = require("../../session");
const { getStyleClassByStatus } = require("../../constants/status");
const keys = require("../../session/keys");
const { serviceUri } = require("../../config");
const { upperFirstLetter } = require("../../lib/display-helper");
const { FLAG_EMOJI } = require("../utils/ui-constants");

const viewModel = (request, page) => {
  return (async () => {
    return { model: await createModel(request, page) };
  })();
};

const getApplicationTableHeader = (sortField) => {
  const direction = sortField && sortField.direction === "DESC" ? "descending" : "ascending";
  const agreementDateTitle = "Agreement date";
  const headerColumns = [
    {
      text: "Agreement number",
      attributes: {
        "aria-sort": sortField && sortField.field === "Reference" ? direction : "none",
        "data-url": "/agreements/sort/Reference",
      },
    },
    {
      html: `<span>Flagged ${FLAG_EMOJI}</span>`,
    },
    {
      text: "Organisation",
      attributes: {
        "aria-sort": sortField && sortField.field === "Organisation" ? direction : "none",
        "data-url": "/agreements/sort/Organisation",
      },
    },
    {
      text: "SBI number",
      attributes: {
        "aria-sort": sortField && sortField.field === "SBI" ? direction : "none",
        "data-url": "/agreements/sort/SBI",
      },
      format: "numeric",
    },
    {
      text: agreementDateTitle,
      attributes: {
        "aria-sort": sortField && sortField.field === "Apply date" ? direction : "none",
        "data-url": "/agreements/sort/Apply date",
      },
      format: "date",
    },
    {
      text: "Status",
      attributes: {
        "aria-sort": sortField && sortField.field === "Status" ? direction : "none",
        "data-url": "/agreements/sort/Status",
      },
    },
    {
      text: "Details",
    },
  ];

  return headerColumns;
};

async function createModel(request, page) {
  const viewTemplate = "agreements";
  const currentPath = `/${viewTemplate}`;
  page = page ?? request.query.page ?? 1;
  const { limit, offset } = getPagination(page);
  const searchText = getAppSearch(request, keys.appSearch.searchText);
  const searchType = getAppSearch(request, keys.appSearch.searchType);
  const filterStatus = getAppSearch(request, keys.appSearch.filterStatus) ?? [];
  const sortField = getAppSearch(request, keys.appSearch.sort) ?? undefined;
  const apps = await getApplications(
    searchType,
    searchText,
    limit,
    offset,
    filterStatus,
    sortField,
    request.logger,
  );

  if (apps.total > 0) {
    let statusClass;
    const applications = apps.applications.map((app) => {
      statusClass = getStyleClassByStatus(app.status.status);
      const row = [
        {
          text: app.reference,
          attributes: { "data-sort-value": `${app.reference}` },
        },
        {
          html: app.flags.length > 0 ? `<span>Yes ${FLAG_EMOJI}</span>` : "",
        },
        {
          text: app.data?.organisation?.name,
          attributes: {
            "data-sort-value": `${app.data?.organisation?.name}`,
          },
        },
        {
          text: app.data?.organisation?.sbi,
          format: "numeric",
          attributes: {
            "data-sort-value": app.data?.organisation?.sbi,
          },
        },
        {
          text: new Date(app.createdAt).toLocaleDateString("en-GB"),
          format: "date",
          attributes: {
            "data-sort-value": app.createdAt,
          },
        },
        {
          html: `<span class="app-long-tag"><span class="govuk-tag ${statusClass}">${upperFirstLetter(app.status.status.toLowerCase())}</span></span>`,
          attributes: {
            "data-sort-value": `${app.status.status}`,
          },
        },
        {
          html:
            app.type === "EE"
              ? `<a href="${serviceUri}/agreement/${app.reference}/claims?page=${page}">View claims</a>`
              : `<a href="${serviceUri}/view-agreement/${app.reference}?page=${page}">View details</a>`,
        },
      ];

      if (app.flags.length) {
        return row.map((rowItem) => ({
          ...rowItem,
          classes: "flagged-item",
        }));
      }

      return row;
    });
    const pagingData = getPagingData(apps.total ?? 0, limit, request.query);
    const groupByStatus = apps.applicationStatus.map((s) => {
      return {
        status: s.status,
        total: s.total,
        styleClass: getStyleClassByStatus(s.status),
        selected: filterStatus.filter((f) => f === s.status).length > 0,
      };
    });

    return {
      applications,
      header: getApplicationTableHeader(getAppSearch(request, keys.appSearch.sort)),
      ...pagingData,
      searchText,
      availableStatus: groupByStatus,
      selectedStatus: groupByStatus
        .filter((s) => s.selected === true)
        .map((s) => {
          return {
            href: `${currentPath}/remove/${s.status}`,
            classes: s.styleClass,
            text: s.status,
          };
        }),
      filterStatus: groupByStatus.map((s) => {
        return {
          value: s.status,
          html: `<div class="govuk-tag ${s.styleClass}"  style="color:#104189;" >${s.status} (${s.total}) </div>`,
          checked: s.selected,
          styleClass: s.styleClass,
        };
      }),
    };
  } else {
    return {
      applications: [],
      error: "No agreements found.",
      searchText,
      availableStatus: [],
      selectedStatus: [],
      filterStatus: [],
    };
  }
}

module.exports = { viewModel, getApplicationTableHeader, createModel };
