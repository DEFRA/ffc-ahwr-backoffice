const viewTemplate = 'applications'
const currentPath = `/${viewTemplate}`
const { displayPageSize } = require('../pagination')
const Joi = require('joi')
const { setAppSearch, getAppSearch } = require('../session')
const keys = require('../session/keys')
const { administrator, processor, user } = require('../auth/permissions')
const ViewModel = require('./models/application-list')
const checkValidSearch = require('../lib/search-validation')

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
        return h.view(viewTemplate, await new ViewModel(request))
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
        return h.view(viewTemplate, await new ViewModel(request))
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
        return h.view(viewTemplate, await new ViewModel(request))
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
          return h.view(viewTemplate, await new ViewModel(request, 1))
        } catch (err) {
          return h.view(viewTemplate, { ...request.payload, error: err }).code(400).takeover()
        }
      }
    }
  }
]
