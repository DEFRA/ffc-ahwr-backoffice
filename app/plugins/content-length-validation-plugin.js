const sizeof = require('object-sizeof')

const contentLengthValidationPlugin = {
  name: 'contentLengthValidation',
  register: (server, options) => {
    const validateContentLength = async (request, h) => {
      const contentLength = request.headers['content-length']
      let actualLength

      if (typeof request.payload === 'object') {
        actualLength = sizeof({ ...request.orig.payload, crumb: request.plugins.crumb })
      } else {
        actualLength = 0
      }

      if (contentLength && parseInt(contentLength) !== actualLength) {
        console.error(`content-length-validation-plugin: ${JSON.stringify({
          contentLength,
          actualLength
        })}`)
        return h.response('Invalid Content-Length').code(400).takeover()
      }

      return h.continue
    }

    server.ext('onPreHandler', validateContentLength)
  }
}

module.exports = contentLengthValidationPlugin
