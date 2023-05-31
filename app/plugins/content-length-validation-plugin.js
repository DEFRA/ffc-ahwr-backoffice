const contentLengthValidationPlugin = {
  name: 'contentLengthValidation',
  register: (server, options) => {
    const validateContentLength = async (request, h) => {
      const contentLength = request.headers['content-length']
      let actualLength

      if (typeof request.payload === 'string') {
        actualLength = Buffer.byteLength(request.payload)
      } else if (Buffer.isBuffer(request.payload)) {
        actualLength = request.payload.length
      } else if (typeof request.payload === 'number') {
        actualLength = Buffer.byteLength(request.payload.toString())
      } else if (typeof request.payload === 'object') {
        actualLength = Buffer.byteLength(JSON.stringify(request.payload))
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
