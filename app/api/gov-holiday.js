const wreck = require('@hapi/wreck')

async function getHolidayCalendarForEngland () {
  const endpoint = 'https://www.gov.uk/bank-holidays.json'
  const { payload } = await wreck.get(endpoint, { json: true })
  if (!(payload?.['england-and-wales']?.events)) {
    throw new Error('bank holidays response missing events')
  }
  return payload['england-and-wales'].events // Returns only the events for England and Wales
}

async function isTodayCustomHoliday () {
  const url = `${process.env.APPLICATION_API_URI}/holidays/isTodayHoliday`
  try {
    await wreck.get(url)
    return true
  } catch (err) {
    if (err.output.statusCode === 404) {
      return false
    } else {
      throw err
    }
  }
}

async function isTodayHoliday () {
  const holidays = await module.exports.getHolidayCalendarForEngland()
  const today = new Date().toISOString().split('T')[0] // Format today's date as YYYY-MM-DD
  let isHoliday = holidays?.some(holiday => holiday.date === today)
  if (!isHoliday) isHoliday = await module.exports.isTodayCustomHoliday()
  return isHoliday
}

module.exports = {
  isTodayHoliday,
  getHolidayCalendarForEngland,
  isTodayCustomHoliday
}
