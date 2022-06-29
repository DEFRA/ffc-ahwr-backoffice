const viewTemplate = 'applications'
const currentPath = `/${viewTemplate}`
const { getApplications } = require('../messaging/applications')
const { getPagination, getPagingData } = require('../pagination')
const Joi = require('joi')
const { setAppSearch, getAppSearch } = require('../session')
const keys = require('../session/keys')
const { administrator, processor, user } = require('../auth/permissions')

async function createModel (request, page) {
  page = page ?? request.query.page ?? 1
  const { limit, offset } = getPagination(page)
  const path = request.headers.path ?? ''
  const searchText = getAppSearch(request, keys.appSearch.searchText)
  const searchType = getAppSearch(request, keys.appSearch.searchType)
  const apps = await getApplications(searchType, searchText, limit, offset, request.yar.id)
  if (apps.total > 0) {
    const pagingData = getPagingData(apps.total ?? 0, limit, page, path)
    let statusClass
    return {
      applications: apps.applications.map(n => {
        switch (n.status.status) {
          case 'In Progress':
            statusClass = 'govuk-tag--grey'
            break
          case 'Submitted':
            statusClass = 'govuk-tag--blue'
            break
          case 'Withdrawn':
            statusClass = 'govuk-tag--red'
            break
          case 'Deleted':
            statusClass = 'govuk-tag--red'
            break
          default:
            statusClass = 'govuk-tag--grey'
        }
        return [
          { text: n.reference },
          { text: n.data?.organisation?.name },
          { text: n.data?.organisation?.sbi },
          { text: new Date(n.createdAt).toLocaleDateString('en-GB') },
          { text: new Date(n.createdAt).toLocaleDateString('en-GB') },
          { html: `<span class="govuk-tag ${statusClass}">${n.status.status}</span>` },
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
const appRefRegEx = /^vv-[\da-f]{4}-[\da-f]{4}$/i
const validStatus = ['pending', 'in progress', 'deleted', 'submitted', 'withdrawn', 'completed']
const sbiRegEx = /^[\0-9]{9}$/i
function checkValidSearch (searchText) {
  let searchType
  searchText = (searchText ?? '').trim()
  switch (true) {
    case appRefRegEx.test(searchText):
      searchType = 'ref'
      break
    case validStatus.indexOf(searchText.toLowerCase()) !== -1:
      searchType = 'status'
      break
    case sbiRegEx.test(searchText):
      searchType = 'sbi'
      break
  }

  if (!searchType && searchText.length <= 0) {
    searchType = 'reset'
  }
  if (searchType) {
    return {
      searchText,
      searchType
    }
  } else {
    throw new Error('Invalid search. It should be application reference or status or sbi number.')
  }
}
module.exports = [
  {
    method: 'GET',
    path: currentPath,
    options: {
      auth: { scope: [administrator, processor, user] },
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
      auth: { scope: [administrator, processor, user] },
      validate: {
        query: Joi.object({
          page: Joi.number().greater(0).default(1),
          limit: Joi.number().greater(0).default(10)
        })
      },
      handler: async (request, h) => {
        try {
          const { searchText, searchType } = checkValidSearch(request.payload.searchText)
          setAppSearch(request, keys.appSearch.searchText, searchText ?? '')
          setAppSearch(request, keys.appSearch.searchType, searchType ?? '')
          return h.view(viewTemplate, await createModel(request, 1))
        } catch (err) {
          return h.view(viewTemplate, { ...request.payload, error: err }).code(400).takeover()
        }
      }
    }
  }
]
