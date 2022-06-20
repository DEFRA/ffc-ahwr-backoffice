const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { serviceName } = require('../../../../app/config')

describe('Accessibility Statement', () => {
  test('should load page successfully', async () => {
    const options = {
      method: 'GET',
      url: '/accessibility'
    }
    const response = await global.__SERVER__.inject(options)
    expect(response.statusCode).toBe(200)
    const $ = cheerio.load(response.payload)
    expect($('h1.govuk-heading-l').text()).toEqual(`Accessibility statement for ${serviceName} service`)
    expectPhaseBanner.ok($)
  })
})
