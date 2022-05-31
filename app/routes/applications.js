const viewTemplate = 'applications'
const currentPath = `/${viewTemplate}`
const { getApplications } = require('../messaging/applications')
async function createModel (request, errorMessage) {
  const apps = await getApplications('', '', request.yar.id)
  console.log(apps, 'apps')
  return {
    applications: apps,
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
    path: `${currentPath}/search`,
    handler: (request, h) => {
      console.log(request.payload, 'payload')
      return h.view(viewTemplate, createModel(request, null))
    }
  }
]
