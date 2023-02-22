const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { administrator, processor, user } = require('../../../../app/auth/permissions')
const getCrumbs = require('../../../utils/get-crumbs')

const applications = require('../../../../app/api/applications')
jest.mock('../../../../app/api/applications')

const reference = 'AHWR-555A-FD4C'

applications.withdrawApplication = jest.fn().mockResolvedValue(true)

describe('Withdraw Application test', () => {
  let crumb
  const url = '/withdraw-application/'
  jest.mock('../../../../app/auth')

  beforeEach(async () => {
    crumb = await getCrumbs(global.__SERVER__)
    jest.clearAllMocks()
  })

  describe(`POST ${url} route`, () => {
    test('returns 302 no auth', async () => {
      const options = {
        method: 'POST',
        url
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })

    test('returns 403 when scope is not administrator', async () => {
      const auth = { strategy: 'session-auth', credentials: { scope: [processor, user] } }
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          withdrawConfirmation: 'yes',
          page: 1,
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(403)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('403 - Forbidden')
      expectPhaseBanner.ok($)
    })

    test('returns 403', async () => {
      const auth = { strategy: 'session-auth', credentials: { scope: [processor, user] } }
      const options = {
        method: 'POST',
        url,
        auth,
        payload: {
          reference
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(403)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('403 - Forbidden')
      expectPhaseBanner.ok($)
    })

    test('Approve withdraw application', async () => {
      const auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          withdrawConfirmation: 'yes',
          page: 1,
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(applications.withdrawApplication).toHaveBeenCalledTimes(1)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
    })

    test('Cancel withdraw application', async () => {
      const auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          withdrawConfirmation: 'no',
          page: 1,
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(applications.withdrawApplication).toHaveBeenCalledTimes(0)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
    })
  })
})
