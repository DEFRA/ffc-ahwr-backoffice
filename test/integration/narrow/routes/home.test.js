const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName } = require('../../../../app/config')

describe('Home page test', () => {
  test('GET / route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual(serviceName)
    expect($('.govuk-warning-text__text').text()).toMatch('This is not a real service and is for demonstration purposes only.')
    expectPhaseBanner.ok($)
  })
})
