const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')

describe('Applications test', () => {
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
      expectPhaseBanner.ok($)
    })
  })
})
