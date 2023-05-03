const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { administrator, processor, user, recommender, authoriser } = require('../../../../app/auth/permissions')

describe('Account page test', () => {
  const url = '/account'
  jest.mock('../../../../app/auth')
  let auth = { strategy: 'session-auth', credentials: { scope: ['administrator'] } }

  beforeAll(() => {
    jest.clearAllMocks()
  })

  describe(`GET ${url} route`, () => {
    test('returns 302 no auth', async () => {
      const options = {
        method: 'GET',
        url
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })
    test.each([
      ['Test user 1', [administrator]],
      ['Test user 2', [processor]],
      ['Test user 3', [user]],
      ['Test user 4', [recommender]],
      ['Test user 5', [authoriser]],
      ['Test user 6', [administrator, processor, user, recommender, authoriser]]
    ])('returns 200, page loads successfully', async (userName, roles) => {
      auth = { strategy: 'session-auth', credentials: { scope: roles, account: { homeAccountId: 'testId', name: userName } } }
      const options = {
        method: 'GET',
        url,
        auth
      }
      const response = await global.__SERVER__.inject(options)
      expect(response.statusCode).toBe(200)

      const $ = cheerio.load(response.payload)
      expect($('.govuk-summary-list__row').length).toEqual(2)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('User')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch(userName)
      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Roles')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch(roles.join(', '))
      expectPhaseBanner.ok($)
    })
  })
})
