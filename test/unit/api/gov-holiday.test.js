// Assuming your functions are exported from a file named holidays.js
const { getHolidayCalendarForEngland, isTodayHoliday } = require('../../../app/api/gov-holiday')

// Mocking the @hapi/wreck module
jest.mock('@hapi/wreck', () => ({
  get: jest.fn()
}))

const Wreck = require('@hapi/wreck')

describe('Holiday Functions', () => {
  describe('getHolidayCalendarForEngland', () => {
    it('should fetch the holiday calendar and return the events', async () => {
      // Mock the API response
      const mockEvents = [{ date: '2024-01-01', title: 'New Year’s Day' }]
      Wreck.get.mockResolvedValue({
        payload: {
          'england-and-wales': {
            events: mockEvents
          }
        }
      })

      const events = await getHolidayCalendarForEngland()
      expect(events).toEqual(mockEvents)
      expect(Wreck.get).toHaveBeenCalledWith('https://www.gov.uk/bank-holidays.json', { json: true })
    })

    it('should handle errors gracefully', async () => {
      Wreck.get.mockRejectedValue(new Error('Network error'))

      await expect(getHolidayCalendarForEngland()).resolves.toEqual([])
    })
  })

  describe('isTodayHoliday', () => {
    it('should return true if today is a holiday', async () => {
      // Mock today's date and the API response
      const today = new Date().toISOString().split('T')[0]
      const mockEvents = [{ date: today, title: 'Mock Holiday' }]
      Wreck.get.mockResolvedValue({
        payload: {
          'england-and-wales': {
            events: mockEvents
          }
        }
      })

      await expect(isTodayHoliday()).resolves.toBe(true)
    })

    it('should return false if today is not a holiday', async () => {
      // Mock today's date and the API response
      const tomorrow = new Date(new Date().getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      const mockEvents = [{ date: tomorrow, title: 'Mock Holiday' }]
      Wreck.get.mockResolvedValue({
        payload: {
          'england-and-wales': {
            events: mockEvents
          }
        }
      })

      await expect(isTodayHoliday()).resolves.toBe(false)
    })

    it('when Events NULL should return false if today is not a holiday', async () => {
      const mockEvents = null
      Wreck.get.mockResolvedValue({
        payload: {
          'england-and-wales': {
            events: mockEvents
          }
        }
      })

      await expect(isTodayHoliday()).resolves.toBe(false)
    })

    it('when payload NULL should return false if today is not a holiday', async () => {
      const payloadNull = null
      Wreck.get.mockResolvedValue({
        payload: payloadNull
      })

      await expect(isTodayHoliday()).resolves.toBe(false)
    })

    it('when payload not have division should return false if today is not a holiday', async () => {
      Wreck.get.mockResolvedValue({
        payload: {}
      })

      await expect(isTodayHoliday()).resolves.toBe(false)
    })

    it('when isTodayHoliday throw error should return false if today is not a holiday', async () => {
      Wreck.get.mockResolvedValue({
        payload: {
          'england-and-wales': {
            events: {}
          }
        }
      })
      // Spy on console.error to verify it was called
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      await expect(isTodayHoliday()).resolves.toBe(false)
      // Verify console.error was called with the expected message
      expect(consoleSpy).toHaveBeenCalledWith('Checking holiday failed: holidays.some is not a function')
    })
  })
})
