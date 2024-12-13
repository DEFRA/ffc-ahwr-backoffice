const auth = require('../auth')

module.exports = {
  method: 'GET',
  path: '/authenticate',
  options: {
    auth: { mode: 'try' }
  },
  handler: async (request, h) => {
    try {
      console.log('req query', request.query)

      await auth.authenticate(request.query.code, request.cookieAuth)
      return h.redirect('/claims')
    } catch (err) {
      request.logger.setBindings({ err })
    }

    return h.view('error-pages/500').code(500)
  }
}
