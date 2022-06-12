const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const getCrumbs = require('../../../utils/get-crumbs')
// let session

describe('Applications test', () => {
  const url = '/applications'
  // beforeAll(async () => {
  //   jest.resetAllMocks()
  //   session = require('../../../../app/session')
  //   jest.mock('../../../../app/session')
  // })

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
      expectPhaseBanner.ok($)
    })
  })

  describe(`POST ${url} route`, () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { searchDetails: { searchText: '', searchType: 'sbi' } },
      { searchDetails: { searchText: '444444444', searchType: 'sbi' } },
      { searchDetails: { searchText: '444444441', searchType: 'sbi' } }
    ])('returns success when post', async ({ searchDetails }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchDetails },
        headers: { cookie: `crumb=${crumb}` }
      }

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
