require('dotenv').config()

beforeEach(async () => {
  // Set reference to server in order to close the server during teardown.
  jest.setTimeout(10000)
  const createServer = require('../app/server')
  const server = await createServer()
  await server.initialize()
  global.__SERVER__ = server
})
