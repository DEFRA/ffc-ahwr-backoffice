const createServer = require('../../../../app/server')

describe('Login tests', () => {
  let server
  const url = '/login'

  beforeEach(async () => {
    jest.clearAllMocks()
    server = await createServer()
  })

  afterEach(async () => {
    await server.stop()
  })

  jest.mock('../../../../app/auth')
  const mockAzureAuth = require('../../../../app/auth')

  const mockGetAuthenticationUrl = () => {
    mockAzureAuth.getAuthenticationUrl.mockResolvedValue('/')
  }

  describe('Login GET request', () => {
    const method = 'GET'
    mockGetAuthenticationUrl()
    test('GET /login route returns 200', async () => {
      const options = {
        method,
        url
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toEqual('/')
    })

    test('GET /login route returns 500 error if auth fails', async () => {
      const options = {
        method,
        url
      }
      mockAzureAuth.getAuthenticationUrl.mockImplementation(() => {
        throw new Error()
      })
      const response = await server.inject(options)
      expect(response.statusCode).toBe(500)
    })
  })
})
