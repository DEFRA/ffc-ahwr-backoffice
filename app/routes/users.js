const viewTemplate = 'users'
const currentPath = `/${viewTemplate}`
const { administrator, processor, user } = require('../auth/permissions')
const { setUserSearch } = require('../session')
const keys = require('../session/keys')
const Joi = require('joi')
const checkValidSearch = require('../lib/search-validation')
const { UsersViewModel } = require('./models/users-list')

module.exports = [
  {
    method: 'GET',
    path: currentPath,
    options: {
      auth: { scope: [administrator, processor, user] },
      handler: async (request, h) => {
        return h.view(viewTemplate, await new UsersViewModel(request)) // NOSONAR
      }
    }
  },
  {
    method: 'GET',
    path: `${currentPath}/sort/{field}/{direction}`,
    options: {
      auth: { scope: [administrator, processor, user] },
      validate: {
        params: Joi.object({
          field: Joi.string(),
          direction: Joi.string()
        })
      },
      handler: async (request, h) => {
        request.params.direction = request.params.direction !== 'descending' ? 'DESC' : 'ASC'
        setUserSearch(request, keys.userSearch.sort, request.params)
        return 1 // NOSONAR
      }
    }
  },
  {
    method: 'POST',
    path: `${currentPath}`,
    options: {
      auth: { scope: [administrator, processor, user] },
      handler: async (request, h) => {
        try {
          const { searchText, searchType } = checkValidSearch(request.payload.searchText)
          setUserSearch(request, keys.userSearch.searchText, searchText ?? '')
          setUserSearch(request, keys.userSearch.searchType, searchType ?? '')
          return h.view(viewTemplate, await new UsersViewModel(request)) // NOSONAR
        } catch (err) {
          return h.view(viewTemplate, { ...request.payload, error: err }).code(400).takeover()
        }
      }
    }
  }
]
