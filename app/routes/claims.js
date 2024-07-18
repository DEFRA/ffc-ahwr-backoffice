const Joi = require('joi')
const { setClaimSort } = require('../session')
const { claimSort } = require('../session/keys')
const crumbCache = require('./utils/crumb-cache')
const { displayPageSize } = require('../pagination')
const { viewModel } = require('./models/claim-list')
const { administrator, authoriser, processor, recommender, user } = require('../auth/permissions')

const viewTemplate = 'claims'
const currentPath = `/${viewTemplate}`

module.exports = [{
  method: 'GET',
  path: currentPath,
  options: {
    auth: { scope: [administrator, authoriser, processor, recommender, user] },
    handler: async (request, h) => {
      await crumbCache.generateNewCrumb(request, h)
      return h.view('claims', await viewModel(request)) // NOSONAR
    }
  }
},
{
  method: 'GET',
  path: `${currentPath}/sort/{field}/{direction}`,
  options: {
    auth: { scope: [administrator, processor, user, recommender, authoriser] },
    validate: {
      params: Joi.object({
        field: Joi.string(),
        direction: Joi.string()
      })
    },
    handler: async (request, h) => {
      request.params.direction = request.params.direction !== 'descending' ? 'DESC' : 'ASC'
      setClaimSort(request, claimSort.sort, request.params)
      return 1 // NOSONAR
    }
  }
}, {
  method: 'POST',
  path: `${currentPath}`,
  options: {
    auth: { scope: [administrator, processor, user, recommender, authoriser] },
    validate: {
      query: Joi.object({
        page: Joi.number().greater(0).default(1),
        limit: Joi.number().greater(0).default(displayPageSize)
      })
    },
    handler: async (request, h) => {
      try {
        return h.view(viewTemplate, await viewModel(request, 1)) // NOSONAR
      } catch (err) {
        return h.view(viewTemplate, { ...request.payload, error: err }).code(400).takeover()
      }
    }
  }
}
]
