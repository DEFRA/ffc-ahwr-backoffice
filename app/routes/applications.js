const viewTemplate = 'applications'
const currentPath = `/${viewTemplate}`
const { getApplications } = require('../api/applications')
const { getPagination, getPagingData, displayPageSize } = require('../pagination')
const Joi = require('joi')
const { setAppSearch, getAppSearch } = require('../session')
const keys = require('../session/keys')
const getStyleClassByStatus = require('../constants/status')
const { administrator, processor, user } = require('../auth/permissions')
async function createModel (request, page) {
  page = page ?? request.query.page ?? 1
  const { limit, offset } = getPagination(page)
  const path = request.headers.path ?? ''
  const searchText = getAppSearch(request, keys.appSearch.searchText)
  const searchType = getAppSearch(request, keys.appSearch.searchType)
  const filterStatus = getAppSearch(request, keys.appSearch.filterStatus) ?? []
  const apps = await getApplications(searchType, searchText, limit, offset, filterStatus)
  if (apps.total > 0) {
    let statusClass
    const applications = apps.applications.map(n => {
      statusClass = getStyleClassByStatus(n.status.status)
      return [
        { text: n.reference },
        { text: n.data?.organisation?.name },
        {
          text: n.data?.organisation?.sbi,
          format: 'number',
          attributes: {
            'data-sort-value': n.data?.organisation?.sbi
          }
        },
        {
          text: new Date(n.createdAt).toLocaleDateString('en-GB'),
          format: 'date',
          attributes: {
            'data-sort-value': new Date(n.createdAt).toLocaleDateString('en-GB')
          }
        },
        {
          html: `<span class="govuk-tag ${statusClass}">${n.status.status}</span>`,
          attributes: {
            'data-sort-value': `${n.status.status}`
          }
        },
        { html: `<a href="view-application/${n.reference}">View application</a>` }
      ]
    })
    const pagingData = getPagingData(apps.total ?? 0, limit, page, path)
    const groupByStatus = apps.applicationStatus.map(s => {
      return {
        status: s.status,
        total: s.total,
        styleClass: getStyleClassByStatus(s.status),
        selected: filterStatus.filter(f => f === s.status).length > 0
      }
    })
    return {
      applications,
      ...pagingData,
      searchText,
      availableStatus: groupByStatus,
      selectedStatus: groupByStatus.filter(s => s.selected === true).map(s => {
        return {
          href: `${currentPath}/remove/${s.status}`,
          classes: s.styleClass,
          text: s.status
        }
      }),
      filterStatus: groupByStatus.map(s => {
        return {
          value: s.status,
          html: `<div class="govuk-tag ${s.styleClass}"  style="color:#104189;" >${s.status} (${s.total}) </div>`,
          checked: s.selected,
          styleClass: s.styleClass
        }
      })
    }
  } else {
    return {
      applications: [],
      error: 'No Applications found.',
      searchText,
      availableStatus: [],
      selectedStatus: [],
      filterStatus: []
    }
  }
}
const appRefRegEx = /^vv-[\da-f]{4}-[\da-f]{4}$/i
const validStatus = ['applied', 'withdrawn', 'data inputted', 'claimed', 'check', 'accepted', 'rejected', 'paid']
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
          limit: Joi.number().greater(0).default(displayPageSize)
        })
      },
      handler: async (request, h) => {
        return h.view(viewTemplate, await createModel(request))
      }
    }
  },
  {
    method: 'GET',
    path: `${currentPath}/clear`,
    options: {
      auth: { scope: [administrator, processor, user] },
      handler: async (request, h) => {
        setAppSearch(request, keys.appSearch.filterStatus, [])
        return h.view(viewTemplate, await createModel(request))
      }
    }
  },
  {
    method: 'GET',
    path: `${currentPath}/remove/{status}`,
    options: {
      auth: { scope: [administrator, processor, user] },
      validate: {
        params: Joi.object({
          status: Joi.string()
        })
      },
      handler: async (request, h) => {
        let filterStatus = getAppSearch(request, keys.appSearch.filterStatus)
        filterStatus = filterStatus.filter(s => s !== request.params.status)
        setAppSearch(request, keys.appSearch.filterStatus, filterStatus)
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
          limit: Joi.number().greater(0).default(displayPageSize)
        })
      },
      handler: async (request, h) => {
        try {
          let filterStatus = []
          // Is Search Button Clicked
          if (!request.payload.submit) {
            filterStatus = request.payload?.status ?? []
            filterStatus = Array.isArray(filterStatus) ? filterStatus : [filterStatus]
          }

          setAppSearch(request, keys.appSearch.filterStatus, filterStatus)
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
