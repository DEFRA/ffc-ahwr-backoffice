const auth = require('../auth')

module.exports = {
  method: 'GET',
  path: '/authenticate',
  options: {
    auth: { mode: 'try' }
  },
  handler: async (request, h) => {
    try {
      await auth.authenticate(request.query.code, request.cookieAuth, request.logger)
      return h.redirect('/')
    } catch (err) {
      request.logger.setBindings({ err })
    }

    return h.view('error-pages/500').code(500)
  }
}
