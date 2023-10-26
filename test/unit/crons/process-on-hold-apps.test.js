const MOCK_NOW = new Date()

describe('Process process on hold applications function test.', () => {
  jest.mock('../../../app/api/applications')
  const { processApplicationClaim, getApplications } = require('../../../app/api/applications')

  beforeEach(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)
    jest.mock('../../../app/config', () => ({
      ...jest.requireActual('../../../../app/config'),
      onHoldAppScheduler: {
        enabled: true,
        schedule: '0 18 * * 1-5'
      }
    }))
    processApplicationClaim.mockResolvedValue(true)
    getApplications.mockResolvedValue({
      applications: [{
        reference: 'ABC-XYZ-123'
      }],
      total: 1
    })
  })

  afterAll(() => {
    jest.resetModules()
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('test error while running process', async () => {
    const processOnHoldApplications = require('../../../app/crons/process-on-hold/process')
    getApplications.mockImplementation(async () => {
      throw new Error('Invalid something error')
    })
    const result = await processOnHoldApplications()
    expect(result).toBeFalsy()
    expect(getApplications).toHaveBeenCalled()
    expect(processApplicationClaim).not.toHaveBeenCalled()
  })

  test('test error handled', async () => {
    const processOnHoldApplications = require('../../../app/crons/process-on-hold/process')
    processApplicationClaim.mockImplementation(async () => {
      throw new Error('Invalid something error')
    })
    const result = await processOnHoldApplications()
    expect(result).toBeFalsy()
    expect(getApplications).toHaveBeenCalled()
    expect(processApplicationClaim).toHaveBeenCalled()
  })

  test('test error handled no pending application', async () => {
    const processOnHoldApplications = require('../../../app/crons/process-on-hold/process')
    getApplications.mockResolvedValue({
      applications: [],
      total: 0
    })
    const result = await processOnHoldApplications()
    expect(result).toBeFalsy()
    expect(getApplications).toHaveBeenCalled()
    expect(processApplicationClaim).not.toHaveBeenCalled()
  })

  test('success to process on hold application', async () => {
    getApplications.mockResolvedValueOnce({
      applications: [{
        reference: 'ABC-XYZ-123'
      }],
      total: 1
    })
    const processOnHoldApplications = require('../../../app/crons/process-on-hold/process')
    const result = await processOnHoldApplications()
    expect(result).toBeTruthy()
    expect(getApplications).toHaveBeenCalled()
    expect(processApplicationClaim).toHaveBeenCalled()
  })
})
