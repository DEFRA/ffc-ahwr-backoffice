// const { when, resetAllWhenMocks } = require('jest-when')
// Assuming your functions are exported from a file named holidays.js
// const { getHolidayCalendarForEngland, isTodayCustomHoliday } = require('../../../app/api/gov-holiday')
// const { isTodayHoliday } = require('../../../app/api/gov-holiday')
// const Holidays = require('../../../app/api/gov-holiday')
const holidays = require('../../../app/api/gov-holiday')

const Wreck = require('@hapi/wreck')

describe('Holiday Functions', () => {
  describe('getHolidayCalendarForEngland', () => {
    let wreckGetSpy

    beforeEach(() => {
      wreckGetSpy = jest.spyOn(Wreck, 'get')
    })

    afterEach(() => {
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

    it('should throw errors', async () => {
      wreckGetSpy.mockRejectedValueOnce('holiday boom')

      expect(async () => {
        await holidays.getHolidayCalendarForEngland()
      }).rejects.toBe('holiday boom')
    })

    it('throws if payload is missing events', async () => {
      wreckGetSpy.mockResolvedValue({
        payload: []
      })

      expect(async () => {
        await holidays.getHolidayCalendarForEngland()
      }).rejects.toThrow('bank holidays response missing events')
    })
  })

  describe('isTodayCustomHoliday', () => {
    let wreckGetSpy

    beforeEach(() => {
      wreckGetSpy = jest.spyOn(Wreck, 'get')
    })

    afterEach(() => {
      wreckGetSpy.mockRestore()
    })

    it('should return true when 200 response', async () => {
      wreckGetSpy.mockResolvedValue({
        payload: null
      })

      expect(await holidays.isTodayCustomHoliday()).toBeTruthy()
    })

    it('should return false when response is 404', async () => {
      wreckGetSpy.mockRejectedValueOnce({
        output: { statusCode: 404 }
      })

      expect(await holidays.isTodayCustomHoliday()).toBe(false)
    })

    it('should return throw errors', async () => {
      const errorResponse = {
        output: { statusCode: 500 }
      }

      wreckGetSpy.mockRejectedValueOnce(errorResponse)

      expect(async () => {
        await holidays.isTodayCustomHoliday()
      }).rejects.toBe(errorResponse)
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
