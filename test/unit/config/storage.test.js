const storageConfig = require('../../../app/config/storage')

describe('Storage Config Test', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })
  test('Should pass validation for all fields populated', async () => {
    expect(storageConfig).toBeDefined()
  })

  test('Invalid env var throws error', () => {
    try {
      process.env.AZURE_STORAGE_USE_CONNECTION_STRING = null
      require('../../../app/config/storage')
    } catch (err) {
      expect(err.message).toBe('The storage config is invalid. "useConnectionString" must be a boolean')
    }
  })
})
