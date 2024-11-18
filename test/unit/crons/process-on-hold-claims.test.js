const MOCK_NOW = new Date()

describe('Process process on hold claims function test.', () => {
  jest.mock('../../../app/api/claims')
  const { updateClaimStatus, getClaims } = require('../../../app/api/claims')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(MOCK_NOW)
    jest.mock('../../../app/config', () => ({
      ...jest.requireActual('../../../app/config'),
      onHoldAppScheduler: {
        enabled: true,
        schedule: '0 18 * * 1-5'
      }
    }))
    updateClaimStatus.mockResolvedValue(true)
    getClaims.mockResolvedValue({
      claims: [{
        reference: 'ABC-XYZ-123',
        updatedAt: '2023-10-01T19:40:00.424Z'
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
    const { processOnHoldClaims } = require('../../../app/crons/process-on-hold/process')
    getClaims.mockRejectedValueOnce('getClaims boom')

    expect(async () => {
      await processOnHoldClaims()
    }).rejects.toBe('getClaims boom')
  })

  test('test error handled no pending claims', async () => {
    const { processOnHoldClaims } = require('../../../app/crons/process-on-hold/process')
    getClaims.mockResolvedValue({
      applications: [],
      total: 0
    })
    const server = { setBindings: jest.fn() }
    await processOnHoldClaims(server)

    expect(getClaims).toHaveBeenCalled()
    expect(updateClaimStatus).not.toHaveBeenCalled()
  })

  test('success to process on hold claims', async () => {
    getClaims.mockResolvedValueOnce({
      claims: [{
        reference: 'ABC-XYZ-123',
        updatedAt: '2023-10-01T19:40:00.424Z'
      }],
      total: 1
    })
    const { processOnHoldClaims } = require('../../../app/crons/process-on-hold/process')
    const server = { setBindings: jest.fn() }
    await processOnHoldClaims(server)

    expect(getClaims).toHaveBeenCalled()
    expect(updateClaimStatus).toHaveBeenCalled()
  })
})
