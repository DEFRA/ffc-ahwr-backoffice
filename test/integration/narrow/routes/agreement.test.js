const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { administrator } = require('../../../../app/auth/permissions')

const applicationData = require('../../../data/applications.json')
const applications = require('../../../../app/api/applications')
jest.mock('../../../../app/api/applications')
applications.getApplication = jest.fn().mockReturnValue(applicationData.applications[0])

const claimData = require('../../../data/claims.json')
const claims = require('../../../../app/api/claims')
jest.mock('../../../../app/api/claims')
claims.getClaimsByApplicationReference = jest.fn().mockReturnValue(claimData)

const contactHistoryData = require('../../../data/contact-history.json')
const contactHistory = require('../../../../app/api/contact-history')
jest.mock('../../../../app/api/contact-history.js')
contactHistory.getContactHistory = jest.fn().mockReturnValue(contactHistoryData)

const pagination = require('../../../../app/pagination')
jest.mock('../../../../app/pagination')

pagination.getPagination = jest.fn().mockReturnValue({
  limit: 10, offset: 0
})

pagination.getPagingData = jest.fn().mockReturnValue({
  page: 1, totalPages: 1, total: 1, limit: 10
})

jest.mock('../../../../app/api/claims.js')
claims.getClaims = jest.fn().mockReturnValue({ total: 9, claims: claimData })

jest.mock('../../../../app/api/contact-history.js')
contactHistory.displayContactHistory = jest.fn().mockReturnValue({
  orgEmail: 'Na',
  email: 'test12@testvest.com',
  farmerName: 'NA',
  address: 'NA'
})

jest.mock('../../../../app/auth')
const auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: 'test user' } }

jest.mock('../../../../app/session')
const session = require('../../../../app/session')

describe('Claims test', () => {
  const url = '/agreement/123/claims'

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
        url: `${url}?page=1`,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('title').text()).toContain('Administration - My Farm')
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
      session.getClaimSearch.mockReturnValueOnce({ field: 'claim number', direction: 'ASC' })

      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('title').text()).toContain('Administration - My Farm')
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
      session.getClaimSearch.mockReturnValueOnce({ field, direction })

      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('title').text()).toContain('Administration - My Farm')
      expectPhaseBanner.ok($)
    })

    test('returns 200 sort endpoint', async () => {
      const options = {
        method: 'GET',
        url: '/agreement/123/claims/sort/claim number/DESC',
        auth
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.result).toEqual(1)
    })
    test('the back link should go to view claim if the user is coming from view claim page', async () => {
      const options = {
        method: 'GET',
        url: `${url}?page=1&returnPage=view-claim&reference=REDC-6179-D9D3`,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('title').text()).toContain('Administration - My Farm')
      expectPhaseBanner.ok($)

      expect($('.govuk-back-link').attr('href')).toEqual('/view-claim/REDC-6179-D9D3')
    })
    test('the back link should go to all agreements if the user is coming from all agreements main tab', async () => {
      const options = {
        method: 'GET',
        url: `${url}?page=1`,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('title').text()).toContain('Administration - My Farm')
      expectPhaseBanner.ok($)

      expect($('.govuk-back-link').attr('href')).toEqual('/agreements?page=1')
    })
  })
})
