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

jest.mock('../../../../app/session')
const session = require('../../../../app/session')

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

    test('returns 400 if application is undefined', async () => {
      applications.getApplication.mockReturnValueOnce(undefined)
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
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

      expect($('th[aria-sort]')[0].attribs['aria-sort']).toEqual('none')
      expect($('th[aria-sort]')[0].attribs['data-url']).toContain('claim number')
      expect($('th[aria-sort]')[1].attribs['aria-sort']).toEqual('none')
      expect($('th[aria-sort]')[1].attribs['data-url']).toContain('type of visit')
      expect($('th[aria-sort]')[2].attribs['aria-sort']).toEqual('none')
      expect($('th[aria-sort]')[2].attribs['data-url']).toContain('species')
      expect($('th[aria-sort]')[3].attribs['aria-sort']).toEqual('none')
      expect($('th[aria-sort]')[3].attribs['data-url']).toContain('claim date')
      expect($('th[aria-sort]')[4].attribs['aria-sort']).toEqual('none')
      expect($('th[aria-sort]')[4].attribs['data-url']).toContain('status')
    })

    test('returns table in correct sort order', async () => {
      session.getClaimSort.mockReturnValueOnce({ field: 'claim number' })

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

      expect($('th[aria-sort]')[0].attribs['aria-sort']).toEqual('ascending')
      expect($('th[aria-sort]')[0].attribs['data-url']).toContain('claim number')
      expect($('th[aria-sort]')[1].attribs['aria-sort']).toEqual('none')
      expect($('th[aria-sort]')[1].attribs['data-url']).toContain('type of visit')
      expect($('th[aria-sort]')[2].attribs['aria-sort']).toEqual('none')
      expect($('th[aria-sort]')[2].attribs['data-url']).toContain('species')
      expect($('th[aria-sort]')[3].attribs['aria-sort']).toEqual('none')
      expect($('th[aria-sort]')[3].attribs['data-url']).toContain('claim date')
      expect($('th[aria-sort]')[4].attribs['aria-sort']).toEqual('none')
      expect($('th[aria-sort]')[4].attribs['data-url']).toContain('status')
    })

    test.each([
      { field: 'claim number', direction: 'ASC' },
      { field: 'type of visit', direction: 'ASC' },
      { field: 'species', direction: 'ASC' },
      { field: 'claim date', direction: 'ASC' },
      { field: 'status', direction: 'ASC' },
      { field: 'claim number', direction: 'DESC' },
      { field: 'type of visit', direction: 'DESC' },
      { field: 'species', direction: 'DESC' },
      { field: 'claim date', direction: 'DESC' },
      { field: 'status', direction: 'DESC' }
    ])('returns table in correct $direction sort order on field $field', async ({ field, direction }) => {
      session.getClaimSort.mockReturnValueOnce({ field, direction })

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

    test('returns 200 sort endpoint', async () => {
      const options = {
        method: 'GET',
        url: '/claims/123/sort/claim number/DESC',
        auth
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.result).toEqual(1)
    })
  })
})
