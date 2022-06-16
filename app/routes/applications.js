const viewTemplate = 'applications'
const currentPath = `/${viewTemplate}`
const { getApplications } = require('../messaging/applications')
const { getPagination, getPagingData } = require('../pagination')
const Joi = require('joi')
const { setAppSearch, getAppSearch } = require('../session')
const keys = require('../session/keys')
const { holdAdmin, schemeAdmin } = require('../auth/permissions')

async function createModel (request) {
  const page = request.query.page ?? 1
  const { limit, offset } = getPagination(page, request.query.limit)
  const path = request.headers.path ?? ''
  const searchText = getAppSearch(request, keys.appSearch.searchText)
  const searchType = getAppSearch(request, keys.appSearch.searchType)
  const apps = await getApplications(searchType, searchText, limit, offset, request.yar.id)
  if (apps.total > 0) {
    const pagingData = getPagingData(apps.total ?? 0, limit, page, path)

    let statusClass, status
    return {
      applications: apps.applications.map(n => {
        switch (n.status) {
          case 1:
            statusClass = 'govuk-tag--grey'
            status = 'In Progress'
            break
          case 2:
            statusClass = 'govuk-tag--blue'
            status = 'Submitted'
            break
          case 3:
            statusClass = 'govuk-tag--red'
            status = 'Withdrawn'
            break
          case 4:
            statusClass = 'govuk-tag--red'
            status = 'Deleted'
            break
          default:
            statusClass = 'govuk-tag--grey'
            status = 'Pending'
        }
        return [
          { text: n.reference },
          { text: n.data.organisation.name },
          { text: n.data.organisation.sbi },
          { text: new Date(n.createdAt).toLocaleDateString('en-GB') },
          { text: new Date(n.createdAt).toLocaleDateString('en-GB') },
          { html: `<span class="govuk-tag ${statusClass}">${status}</span>` },
          { html: `<a href="view-application/${n.reference}">View application</a>` }
        ]
      }),
      ...pagingData,
      searchText
    }
  } else {
    return {
      applications: [],
      error: 'No Applications found.',
      searchText
    }
  }
}
module.exports = [
  {
    method: 'GET',
    path: currentPath,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().greater(0).default(1),
          limit: Joi.number().greater(0).default(10)
        })
      },
      handler: async (request, h) => {
        return h.view(viewTemplate, await createModel(request))
      }
    }
  },
  {
    method: 'POST',
    path: `${currentPath}`,
    options: {
      auth: { scope: [holdAdmin, schemeAdmin] },
      validate: {
        query: Joi.object({
          page: Joi.number().greater(0).default(1),
          limit: Joi.number().greater(0).default(10)
        }),
        payload: Joi.object({
          searchText: Joi.number().min(10000000).max(999999999),
          searchType: Joi.string()
        }),
        failAction: async (request, h, error) => {
          return h.view(viewTemplate, { ...request.payload, errorMessage: { text: error.details[0].message }, error: true }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        setAppSearch(request, keys.appSearch.searchText, request.payload.searchText ?? '')
        setAppSearch(request, keys.appSearch.searchType, request.payload.searchType ?? '')
        return h.view(viewTemplate, await createModel(request))
      }
    }
  }
]
