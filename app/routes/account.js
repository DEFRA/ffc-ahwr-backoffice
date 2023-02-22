const viewTemplate = 'account'
const currentPath = `/${viewTemplate}`
const ViewModel = require('./models/account')

module.exports = {
  method: 'GET',
  path: currentPath,
  options: {
    handler: async (request, h) => {
      return h.view(viewTemplate, new ViewModel(request))
    }
  }
}
