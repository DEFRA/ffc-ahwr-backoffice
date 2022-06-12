const viewTemplate = 'applications'
const currentPath = `/${viewTemplate}`
const { getApplications } = require('../messaging/applications')
const { getPagination, getPagingData } = require('../pagination')
const Joi = require('joi')
const { setAppSearch, getAppSearch } = require('../session')
const keys = require('../session/keys')

async function createModel (request, errorMessage) {
  const { limit, offset } = getPagination(request.query.page, request.query.limit)
  const page = request.query.page ?? 1
  const path = request.headers.path ?? ''
  const searchText = getAppSearch(request, keys.appSearch.searchText)
  const searchType = getAppSearch(request, keys.appSearch.searchType)

  console.log(searchText, searchType, limit, offset, page, 'search for')
  const apps = await getApplications(searchType, searchText, limit, offset, request.yar.id)

  const pagingData = getPagingData(apps.total ?? 0, limit, page, path)

  let statusClass = 'govuk-tag--grey'; let status = 'Pending'

  return {
    applications: apps.applications.map(n => {
      switch (n.status) {
        case '1':
          statusClass = 'govuk-tag--grey'
          status = 'In Progress'
          break
        case '2':
          statusClass = 'govuk-tag--blue'
          status = 'Submitted'
          break
        case '3':
          statusClass = 'govuk-tag--red'
          status = 'Withdrawn'
          break
        case '4':
          statusClass = 'govuk-tag--red'
          status = 'Deleted'
          break
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
    errorMessage,
    searchText
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
        console.log('request')
        return h.view(viewTemplate, await createModel(request, null))
      }
    }
  },
  {
    method: 'POST',
    path: `${currentPath}`,
    handler: async (request, h) => {
      setAppSearch(request, keys.appSearch.searchText, request.payload.searchText ?? '')
      setAppSearch(request, keys.appSearch.searchType, request.payload.searchType ?? '')
      return h.view(viewTemplate, await createModel(request, null))
    }
  }
]
