const viewTemplate = 'orgapplications'
const currentPath = `/${viewTemplate}`
const { getOrgApplications } = require('../messaging/applications')
const { getPagination, getPagingData } = require('../pagination')
async function createModel (request, errorMessage) {
  const { limit, offset } = getPagination(request.query.page, request.query.limit)
  const { searchText, searchType } = request.payload
  const apps = await getOrgApplications(searchText ?? '', searchType ?? '', limit, offset, request.yar.id)
  const pagingData = getPagingData(apps.length, limit, request.query.page, request.headers.path)
  console.log(apps, 'apps')
  return {
    applications: apps,
    ...pagingData,
    errorMessage
  }
}
module.exports = [
  {
    method: 'GET',
    path: currentPath,
    handler: async (request, h) => {
      console.log('request')
      return h.view(viewTemplate, await createModel(request, null))
    }
  },
  {
    method: 'POST',
    path: `${currentPath}`,
    handler: (request, h) => {
      console.log(request.payload, 'payload')
      return h.view(viewTemplate, createModel(request, null))
    }
  }
]
