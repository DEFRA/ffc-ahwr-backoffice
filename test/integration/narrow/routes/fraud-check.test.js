const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const applications = require('../../../../app/api/applications')
const { administrator } = require('../../../../app/auth/permissions')
const getCrumbs = require('../../../utils/get-crumbs')
const reference = 'VV-555A-FD4C'
const sessionMock = require('../../../../app/session')

jest.mock('../../../../app/api/applications')
jest.mock('../../../../app/session')

describe('View Application test', () => {
  const url = `/application/fraud-check/${reference}`
  const method = 'POST'
  jest.mock('../../../../app/auth')
  const auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }
  let crumb

  beforeEach(async () => {
    jest.clearAllMocks()
    crumb = await getCrumbs(global.__SERVER__)
  })

  describe(`POST ${url} route`, () => {
    test('returns 302 no auth', async () => {
      const options = {
        method,
        url,
        payload: { fraudCheck: 'yes ' },
        headers: { cookie: `crumb=${crumb}` }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })
    test('returns 400', async () => {
      const options = {
        method: 'POST',
        url,
        auth,
        payload: { crumb, fraudCheck: 'wronganswser' },
        headers: { cookie: `crumb=${crumb}` }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('400 - Bad Request')
      expectPhaseBanner.ok($)
    })
    test('return 400 when API fails ', async () => {
      const options = {
        method: 'POST',
        url,
        auth,
        payload: { crumb, fraudCheck: 'yes' },
        headers: { cookie: `crumb=${crumb}` }
      }
      applications.submitApplicationFraudCheck.mockResolvedValueOnce(false)
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
      expect(sessionMock.setApplicationFraudCheck).toBeCalledTimes(0)
    })
    test('redirects to view application', async () => {
      const options = {
        method: 'POST',
        url,
        auth,
        payload: { crumb, fraudCheck: 'yes' },
        headers: { cookie: `crumb=${crumb}` }
      }
      applications.submitApplicationFraudCheck.mockResolvedValueOnce(true)
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/view-application/${reference}`)
      expect(sessionMock.setApplicationFraudCheck).toBeCalledTimes(1)
    })
  })
})
