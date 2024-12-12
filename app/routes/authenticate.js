const auth = require('../auth')

module.exports = {
  method: 'GET',
  path: '/authenticate',
  options: {
    auth: { mode: 'try' }
  },
  handler: async (request, h) => {
    try {
      console.log('query', JSON.stringify(request.query))
      console.log('cookieAuth', JSON.stringify(request.cookieAuth))

      await auth.authenticate(request.query.code, request.cookieAuth)
      return h.redirect('/claims')
    } catch (err) {
      request.logger.setBindings({ err })
    }

    return h.view('error-pages/500').code(500)
  }
}
