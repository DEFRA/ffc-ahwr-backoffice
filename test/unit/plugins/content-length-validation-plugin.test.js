const Hapi = require('@hapi/hapi')
const contentLengthValidationPlugin = require('../../../app/plugins/content-length-validation-plugin')

describe('Content Length Validation Plugin', () => {
  let server

  beforeEach(async () => {
    server = Hapi.server()
    await server.register(contentLengthValidationPlugin)

    server.route({
      method: 'POST',
      path: '/',
      handler: (request, h) => {
        return 'Success'
      }
    })
  })

  afterEach(async () => {
    await server.stop()
  })

  test('should pass validation when Content-Length matches payload length', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/',
      headers: {
        'content-length': '10'
      },
      payload: '1234567890'
    })

    expect(response.statusCode).toBe(200)
  })

  test('should return 400 when Content-Length does not match payload length', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/',
      headers: {
        'content-length': '10'
      },
      payload: '12345'
    })

    expect(response.statusCode).toBe(400)
    expect(response.payload).toBe('Invalid Content-Length')
  })
})
