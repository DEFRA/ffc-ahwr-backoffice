describe('Logout test', () => {
  const createServer = require('../../../../app/server')
  let server

  jest.mock('../../../../app/auth/azure-auth')
  const { logout } = require('../../../../app/auth')

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  const auth = {
    strategy: 'session-auth',
    credentials: {
      account: {
        name: 'A Farmer'
      }
    }
  }

  test('GET /logout route redirects to /login', async () => {
    logout.mockResolvedValue({})

    const options = {
      method: 'GET',
      url: '/logout',
      auth
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toEqual('/login')
  })

  afterEach(async () => {
    await server.stop()
  })
})
