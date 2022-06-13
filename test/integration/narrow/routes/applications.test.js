const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const getCrumbs = require('../../../utils/get-crumbs')

const sessionMock = require('../../../../app/session')
jest.mock('../../../../app/session')
const messagingMock = require('../../../../app/messaging')
jest.mock('../../../../app/messaging')

describe('Applications test', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  const url = '/applications'
  describe(`GET ${url} route`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('Applications')
      expect($('title').text()).toContain('Applications')
      expect(sessionMock.getAppSearch).toHaveBeenCalledTimes(2)
      expectPhaseBanner.ok($)
    })
  })

  describe(`POST ${url} route`, () => {
    let crumb
    const method = 'POST'
    const applications = [
      {
        reference: 'ABCDEFGH',
        data: {
          organisation: {
            name: 'Fake Name',
            sbi: '444444444',
            createdAt: new Date(),
            status: 1
          }
        }
      }
    ]
    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { searchDetails: { searchText: '444444444', searchType: 'sbi' } },
      { searchDetails: { searchText: '444444441', searchType: 'sbi' } }
    ])('returns success when post', async ({ searchDetails }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchDetails },
        headers: { cookie: `crumb=${crumb}` }
      }

      sessionMock.getAppSearch.mockReturnValue(searchDetails)
      messagingMock.receiveMessage.mockResolvedValueOnce(applications)
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
    })

    test.each([
      { searchDetails: { searchText: null, searchType: 'sbi' } },
      { searchDetails: { searchText: undefined, searchType: 'sbi' } },
      { searchDetails: { searchText: '1233', searchType: 'sbi' } },
      { searchDetails: { searchText: '', searchType: 'sbi' } },
      { searchDetails: { searchText: 'sdfgsfgsd', searchType: 'sbi' } }
    ])('returns error', async ({ searchDetails }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchDetails },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('')
      expect(res.statusCode).toBe(400)
    })
  })
})
