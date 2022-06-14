const config = require('../../../app/config')

describe('Messaging Config Test', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })
  test('Should pass validation for all fields populated', async () => {
    expect(config).toBeDefined()
  })
  test('Valid env var pass validation', () => {
    const mockKey = 'mock-key'
    process.env.MESSAGE_QUEUE_HOST = mockKey
    const messagingConfig = require('../../../app/config')
    expect(messagingConfig.backOfficeResponseQueue.host).toBe(mockKey)
  })

  test('Invalid env var throws error', () => {
    process.env.MESSAGE_QUEUE_HOST = null
    expect(() => require('../../../app/config')).toThrow()
  })
})
