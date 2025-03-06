const createServer = require('../../../../app/server')

describe('Authentication route tests', () => {
  let server
  const url = '/dev-auth'

  beforeEach(async () => {
    server = await createServer()
    jest.clearAllMocks()
  })

  jest.mock('../../../../app/auth')
  const mockAzureAuth = require('../../../../app/auth')

  describe('Authenticate GET request', () => {
    const method = 'GET'
    test(`GET ${url} route redirects to '/'`, async () => {
      const options = {
        method,
        url
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toEqual('/')
    })

    test(`GET ${url} route returns a 500 error due to try catch`, async () => {
      mockAzureAuth.authenticate.mockImplementation(() => { throw new Error() })
      const options = {
        method,
        url
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })
})
