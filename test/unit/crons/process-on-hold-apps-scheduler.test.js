describe('Process On Hold Applications plugin test', () => {
  const OLD_ENV = process.env
  require('../../../app/api/gov-holiday')

  beforeEach(async () => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('test node cron executed', async () => {
    process.env.ON_HOLD_APP_PROCESS_SCHEDULE = '0 18 * * 1-5'
    const mockNodeCron = require('node-cron')
    jest.mock('node-cron', () => {
      return {
        schedule: jest.fn()
      }
    })
    jest.mock('../../../app/crons/process-on-hold/process', async () => jest.fn())
    require('../../../app/crons/process-on-hold/process')
    const processOnHoldAppsScheduler = require('../../../app/crons/process-on-hold/scheduler')
    await processOnHoldAppsScheduler.plugin.register()
    expect(mockNodeCron.schedule).toHaveBeenCalledWith(
      '0 18 * * 1-5', expect.any(Function), { scheduled: true }
    )
  })

  test('Is Holiday True - test Process On Hold Applications not called', async () => {
    const mockNodeCron = require('node-cron')
    jest.mock('node-cron', () => {
      return {
        schedule: jest.fn()
      }
    })

    // Mock the entire holidays module
    jest.mock('../../../app/api/gov-holiday', () => ({
      isTodayHoliday: jest.fn().mockReturnValue(true),
      getHolidayCalendarForEngland: jest.fn()``
    }))
    jest.mock('../../../app/crons/process-on-hold/process', () => jest.fn())
    const processOnHoldApps = require('../../../app/crons/process-on-hold/process')
    mockNodeCron.schedule.mockImplementationOnce(async (frequency, callback) => await callback())
    const processOnHoldAppsScheduler = require('../../../app/crons/process-on-hold/scheduler')
    await processOnHoldAppsScheduler.plugin.register()
    expect(processOnHoldApps).toBeCalledTimes(0)
  })

  test('test Process On Hold Applications called', async () => {
    const mockNodeCron = require('node-cron')
    jest.mock('node-cron', () => {
      return {
        schedule: jest.fn()
      }
    })
    // Mock the entire holidays module
    jest.mock('../../../app/api/gov-holiday', () => ({
      isTodayHoliday: jest.fn().mockReturnValue(false),
      getHolidayCalendarForEngland: jest.fn()``
    }))
    jest.mock('../../../app/crons/process-on-hold/process', () => jest.fn())
    const processOnHoldApps = require('../../../app/crons/process-on-hold/process')
    mockNodeCron.schedule.mockImplementationOnce(async (frequency, callback) => await callback())
    const processOnHoldAppsScheduler = require('../../../app/crons/process-on-hold/scheduler')
    await processOnHoldAppsScheduler.plugin.register()
    expect(processOnHoldApps).toHaveBeenCalled()
  })
})
