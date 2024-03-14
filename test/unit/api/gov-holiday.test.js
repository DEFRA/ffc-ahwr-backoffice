// const { when, resetAllWhenMocks } = require('jest-when')
// Assuming your functions are exported from a file named holidays.js
// const { getHolidayCalendarForEngland, isTodayCustomHoliday } = require('../../../app/api/gov-holiday')
// const { isTodayHoliday } = require('../../../app/api/gov-holiday')
// const Holidays = require('../../../app/api/gov-holiday')
const holidays = require('../../../app/api/gov-holiday')

// Mocking the @hapi/wreck module
// jest.mock('@hapi/wreck', () => ({
//   get: jest.fn()
// }))

const Wreck = require('@hapi/wreck')

describe('Holiday Functions', () => {
  describe('getHolidayCalendarForEngland', () => {
    let consoleSpy
    let wreckGetSpy

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      wreckGetSpy = jest.spyOn(Wreck, 'get')
    })

    afterEach(() => {
      consoleSpy.mockRestore()
      wreckGetSpy.mockRestore()
    })

    it('should fetch the holiday calendar and return the events', async () => {
      // Mock the API response
      const mockEvents = [{ date: '2024-01-01', title: 'New Year’s Day' }]
      wreckGetSpy.mockResolvedValue({
        payload: {
          'england-and-wales': {
            events: mockEvents
          }
        }
      })

      expect(await holidays.getHolidayCalendarForEngland()).toEqual(mockEvents)
      expect(wreckGetSpy).toHaveBeenCalledWith('https://www.gov.uk/bank-holidays.json', { json: true })
    })

    it('should handle errors gracefully', async () => {
      wreckGetSpy.mockRejectedValue(new Error('Network error'))

      await expect(holidays.getHolidayCalendarForEngland()).resolves.toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Getting holidays failed: Network error')
    })

    it('when payload NULL should return false if today is not a holiday', async () => {
      const payloadNull = null
      wreckGetSpy.mockResolvedValue({
        payload: payloadNull
      })

      await expect(holidays.getHolidayCalendarForEngland()).resolves.toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Getting holidays failed: Invalid payload structure')
    })

    it('when payload not have division should return false if today is not a holiday', async () => {
      wreckGetSpy.mockResolvedValue({
        payload: {}
      })

      await expect(holidays.getHolidayCalendarForEngland()).resolves.toEqual([])
    })
  })

  describe('isTodayCustomHoliday', () => {
    let consoleSpy
    let wreckGetSpy

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      wreckGetSpy = jest.spyOn(Wreck, 'get')
    })

    afterEach(() => {
      consoleSpy.mockRestore()
      wreckGetSpy.mockRestore()
    })

    it('should return true when 200 response', async () => {
      wreckGetSpy.mockResolvedValue({
        payload: null
      })

      expect(await holidays.isTodayCustomHoliday()).toBeTruthy()
      expect(consoleSpy).toHaveBeenCalledWith('today is a custom holiday')
    })

    it('should return false when response is no 200', async () => {
      wreckGetSpy.mockRejectedValue(new Error('Network error'))

      expect(await holidays.isTodayCustomHoliday()).toBeFalsy()
      expect(consoleSpy).toHaveBeenCalledWith('today is not a custom holiday : Network error')
    })
  })

  describe('isTodayHoliday', () => {
    it('should return true if today is a holiday', async () => {
      // Mock today's date and the API response
      const today = new Date().toISOString().split('T')[0]
      const mockEvents = [{ date: today, title: 'Mock Holiday' }]
      holidays.getHolidayCalendarForEngland = jest.fn().mockResolvedValue(mockEvents)
      holidays.isTodayCustomHoliday = jest.fn().mockResolvedValue(false)

      expect(await holidays.isTodayHoliday()).toBeTruthy()
      expect(holidays.getHolidayCalendarForEngland).toHaveBeenCalled()
      expect(holidays.isTodayCustomHoliday).not.toHaveBeenCalled()
    })

    it('should return false if today is not a holiday', async () => {
      // Mock today's date and the API response
      const tomorrow = new Date(new Date().getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      const mockEvents = [{ date: tomorrow, title: 'Mock Holiday' }]
      holidays.getHolidayCalendarForEngland = jest.fn().mockResolvedValue(mockEvents)
      holidays.isTodayCustomHoliday = jest.fn().mockResolvedValue(false)

      expect(await holidays.isTodayHoliday()).toBeFalsy()
      expect(holidays.getHolidayCalendarForEngland).toHaveBeenCalled()
      expect(holidays.isTodayCustomHoliday).toHaveBeenCalled()
    })

    it('when Events NULL should return false if today is not a holiday', async () => {
      const mockEvents = null
      holidays.getHolidayCalendarForEngland = jest.fn().mockResolvedValue(mockEvents)
      holidays.isTodayCustomHoliday = jest.fn().mockResolvedValue(false)

      expect(await holidays.isTodayHoliday()).toBeFalsy()
      expect(holidays.getHolidayCalendarForEngland).toHaveBeenCalled()
      expect(holidays.isTodayCustomHoliday).toHaveBeenCalled()
    })
  })
})
