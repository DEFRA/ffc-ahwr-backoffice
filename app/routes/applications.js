const viewTemplate = 'applications'
const currentPath = `/${viewTemplate}`
const { getApplications } = require('../messaging/applications')
const { getPagination, getPagingData } = require('../pagination')
async function createModel (request, errorMessage) {
  const { limit, offset } = getPagination(request.query.page, request.query.limit)
  let apps
  if (request.payload) {
    apps = await getApplications(request.payload.searchText ?? '', request.payload.searchType ?? '', limit, offset, request.yar.id)
  } else {
    apps = await getApplications('', '', limit, offset, request.yar.id)
  }

  const pagingData = getPagingData(apps.length ?? 0, limit, request.query.page, request.headers.path)
  console.log(apps, 'apps', pagingData)
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
