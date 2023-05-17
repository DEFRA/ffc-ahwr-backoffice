const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { administrator } = require('../../../../app/auth/permissions')
const getCrumbs = require('../../../utils/get-crumbs')

const applications = require('../../../../app/api/applications')
jest.mock('../../../../app/api/applications')

const reference = 'AHWR-555A-FD4C'

applications.processApplicationClaim = jest.fn().mockResolvedValue(true)

describe('Reject Application test', () => {
  let crumb
  const url = '/approve-application-claim/'
  jest.mock('../../../../app/auth')
  let auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }

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

    test('returns 403', async () => {
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

    test('returns 403 when duplicate submission - $crumb', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        auth,
        method: 'POST',
        url,
        payload: {
          reference,
          confirm: ['approveClaim', 'sentChecklist'],
          page: 1,
          crumb
        },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res1 = await global.__SERVER__.inject(options)
      expect(res1.statusCode).toBe(302)
      const res2 = await global.__SERVER__.inject(options)
      expect(res2.statusCode).toBe(403)
      const $ = cheerio.load(res2.payload)
      expectPhaseBanner.ok($)
      expect($('.govuk-heading-l').text()).toEqual('403 - Forbidden')
    })

    test('Approve application claim processed', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          confirm: ['approveClaim', 'sentChecklist'],
          page: 1,
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(applications.processApplicationClaim).toHaveBeenCalledWith(reference, 'admin', true)
      expect(applications.processApplicationClaim).toHaveBeenCalledTimes(1)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
    })

    test('Approve application claim not processed', async () => {
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          confirm: ['sentChecklist'],
          page: 1,
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(applications.processApplicationClaim).not.toHaveBeenCalled()
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
    })

    test('retuns 400 Bad Request', async () => {
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          page: 1,
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(applications.processApplicationClaim).not.toHaveBeenCalled()
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1&errors=${encodeURIComponent(JSON.stringify([{
        text: 'You must select both checkboxes',
        href: '#authorise-payment-panel'
      }]))}`)
    })
  })
})
