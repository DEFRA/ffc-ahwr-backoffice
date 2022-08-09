module.exports = {
  plugin: {
    name: 'cookies',
    register: (server, _) => {
      server.ext('onPreResponse', (request, h) => {
        const statusCode = request.response.statusCode
        if (request.response.variety === 'view' && statusCode !== 404 && statusCode !== 500 && request.response.source.manager._context) {
          request.response.source.manager._context.user = request.auth?.credentials?.account
        }
        return h.continue
      })
    }
  }
}
