const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { administrator } = require('../../../../app/auth/permissions')

const applicationData = require('.././../../data/applications.json')
const applications = require('../../../../app/api/applications')
jest.mock('../../../../app/api/applications')
applications.getApplication = jest.fn().mockReturnValue(applicationData.applications[0])

const claimData = require('.././../../data/claims.json')
const claims = require('../../../../app/api/claims')
jest.mock('../../../../app/api/claims')
claims.getClaims = jest.fn().mockReturnValue(claimData)

jest.mock('../../../../app/auth')
const auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: 'test user' } }

describe('Claims test', () => {
  const url = '/claims/123'

  describe(`GET ${url} route`, () => {
    test('returns 302 no auth', async () => {
      const options = {
        method: 'GET',
        url
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })

    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('title').text()).toContain('Administration - My Farm')
      expect($('h2.govuk-heading-l').text()).toContain('My Farm')
      expectPhaseBanner.ok($)
    })
  })
})
