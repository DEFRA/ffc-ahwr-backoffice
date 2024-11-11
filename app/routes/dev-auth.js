const auth = require('../auth')

module.exports = {
  method: 'GET',
  path: '/dev-auth',
  options: {
    auth: false
  },
  handler: async (request, h) => {
    try {
      await auth.authenticate(undefined, request.cookieAuth)
      return h.redirect('/')
    } catch (err) {
      request.logger.setBindings({ err })
    }
    return h.view('error-pages/500').code(500)
  }
}
