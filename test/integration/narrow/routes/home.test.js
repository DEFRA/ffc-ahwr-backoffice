const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { administrator } = require('../../../../app/auth/permissions')

describe('Home page test', () => {
  const auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }
  jest.mock('../../../../app/auth')
  const method = 'GET'
  const url = '/claims'
  test('returns 302 no auth', async () => {
    const options = {
      method,
      url
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(302)
  })
  test('GET / route returns 200', async () => {
    const options = {
      method,
      url,
      auth
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('Claims')
    expectPhaseBanner.ok($)
  })
})
