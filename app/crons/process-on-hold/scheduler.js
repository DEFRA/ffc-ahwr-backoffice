const appInsights = require('applicationinsights')
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
        const logger = server.logger.child({})
        try {
          const isHoliday = await isTodayHoliday()
          logger.setBindings({ isHoliday })
          if (!isHoliday) {
            await processOnHoldApplications(logger)
            await processOnHoldClaims(logger)
          }

          const { failedApplicationRefs, failedClaimRefs } = logger.bindings()
          if (failedApplicationRefs.length > 0 || failedClaimRefs.length > 0) {
            throw new Error('failed updates')
          }

          logger.info('processing on hold applications and claims')
        } catch (err) {
          logger.error({ err }, 'processing on hold applications and claims')
          appInsights.defaultClient.trackException({ exception: err })
        }
      }, {
        scheduled: config.onHoldAppScheduler.enabled
      })
    }
  }
}
