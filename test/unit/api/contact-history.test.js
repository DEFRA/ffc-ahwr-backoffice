const { getContactHistory, displayContactHistory } = require('../../../app/api/contact-history')
const Wreck = require('@hapi/wreck')

jest.mock('@hapi/wreck')
jest.mock('../../../app/config')

describe('contact-history', () => {
  describe('getContactHistory', () => {
    test('returns null if response status is not 200', async () => {
      const reference = '123'
      Wreck.get.mockReturnValueOnce({
        res: {
          statusCode: 404
        }
      })

      const result = await getContactHistory(reference)

      expect(result).toBeNull()
    })

    test('returns contact history payload on 200 response', async () => {
      const reference = '123'
      const payload = [{ createdAt: '2020-01-01', data: { field: 'email', oldValue: 'test@example.com' } }]
      Wreck.get.mockReturnValueOnce({
        res: {
          statusCode: 200
        },
        payload
      })

      const result = await getContactHistory(reference)

      expect(result).toEqual(payload)
    })
  })

  describe('displayContactHistory', () => {
    test('returns default values when no history', () => {
      const result = displayContactHistory()

      expect(result).toEqual({
        orgEmail: 'NA',
        email: 'NA',
        farmerName: 'NA',
        address: 'NA'
      })
    })

    test('returns mapped contact history values', () => {
      const contactHistory = [{
        createdAt: '2020-01-01',
        data: {
          field: 'orgEmail',
          oldValue: 'org@example.com'
        }
      }, {
        createdAt: '2020-02-01',
        data: {
          field: 'email',
          oldValue: 'test@example.com'
        }
      }]

      const result = displayContactHistory(contactHistory)

      expect(result).toEqual({
        orgEmail: 'org@example.com',
        email: 'test@example.com',
        farmerName: 'NA',
        address: 'NA'
      })
    })
  })
})
