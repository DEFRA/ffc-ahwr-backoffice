const cron = require('node-cron')
const config = require('../../config')
const processOnHoldApplications = require('./process')
const { isTodayHoliday } = require('../../api/gov-holiday')

module.exports = {
  plugin: {
    name: 'onHoldAppScheduler',
    register: async () => {
      console.log(`${new Date().toISOString()} processing OnHold applications:Running on Hold application scheduler... ${JSON.stringify(
        config.onHoldAppScheduler
      )}`)
      cron.schedule(config.onHoldAppScheduler.schedule, async () => {
        try {
          const isHoliday = await isTodayHoliday()
          if (isHoliday) {
            console.log('Today is a holiday.')
          } else {
            console.log(`${new Date().toISOString()} processing OnHold applications:on Hold applications are about to be processed`)
            await processOnHoldApplications()
            console.log(`${new Date().toISOString()} processing OnHold applications:on Hold applications has been processed`)
          }
        } catch (error) {
          console.error(`${new Date().toISOString()} processing OnHold applications: Error while processing on Hold applications`, error)
        }
      }, {
        scheduled: config.onHoldAppScheduler.enabled
      })
    }
  }
}
