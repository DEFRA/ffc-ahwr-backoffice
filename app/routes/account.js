const viewTemplate = 'account'
const currentPath = `/${viewTemplate}`
const { administrator, processor, user } = require('../auth/permissions')
const ViewModel = require('./models/account')

module.exports = {
  method: 'GET',
  path: currentPath,
  options: {
    auth: { scope: [administrator, processor, user] },
    handler: async (request, h) => {
      return h.view(viewTemplate, new ViewModel(request))
    }
  }
}
