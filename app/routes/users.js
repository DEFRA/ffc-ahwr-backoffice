const viewTemplate = 'users'
const currentPath = `/${viewTemplate}`
const { administrator, processor, user } = require('../auth/permissions')
const { UsersViewModel } = require('./models/users-list')


module.exports = [
  {
    method: 'GET',
    path: currentPath,
    options: {
      auth: { scope: [administrator, processor, user] },
      handler: async (request, h) => {
        return h.view(viewTemplate,  await new UsersViewModel(request)) // NOSONAR
      }
    }
  }
]
