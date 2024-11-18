const cron = require('node-cron')
const config = require('../../config')
const { processOnHoldApplications, processOnHoldClaims } = require('./process')
const { isTodayHoliday } = require('../../api/gov-holiday')

module.exports = {
  plugin: {
    name: 'onHoldAppScheduler',
    register: async (server) => {
      server.logger.info({
        schedule: config.onHoldAppScheduler
      }, 'registering schedule for processing on hold applications and claims')

      cron.schedule(config.onHoldAppScheduler.schedule, async () => {
        try {
          const isHoliday = await isTodayHoliday()
          server.logger.setBindings({ isHoliday })
          if (!isHoliday) {
            await processOnHoldApplications(server.logger)
            await processOnHoldClaims(server.logger)
          }
          server.logger.info('processing on hold applications and claims')
        } catch (err) {
          server.logger.error({ err }, 'processing on hold applications and claims')
        }
      }, {
        scheduled: config.onHoldAppScheduler.enabled
      })
    }
  }
}
