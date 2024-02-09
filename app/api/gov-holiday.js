const Wreck = require('@hapi/wreck')

async function getHolidayCalendarForEngland () {
  const url = 'https://www.gov.uk/bank-holidays.json'
  try {
    const { payload } = await Wreck.get(url, { json: true })
    if (!(payload?.['england-and-wales']?.events)) {
      throw new Error('Invalid payload structure')
    }
    return payload['england-and-wales'].events // Returns only the events for England and Wales
  } catch (err) {
    console.error(`Getting holidays failed: ${err.message}`)
    return [] // Return an empty array in case of error
  }
}

async function isTodayHoliday () {
  try {
    const holidays = await getHolidayCalendarForEngland()
    const today = new Date().toISOString().split('T')[0] // Format today's date as YYYY-MM-DD
    const isHoliday = holidays.some(holiday => holiday.date === today)
    return isHoliday
  } catch (err) {
    console.error(`Checking holiday failed: ${err.message}`)
    return false // Assume not a holiday in case of error
  }
}

module.exports = {
  isTodayHoliday,
  getHolidayCalendarForEngland
}