const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const getCrumbs = require('../../../utils/get-crumbs')
const { administrator } = require('../../../../app/auth/permissions')
const sessionMock = require('../../../../app/session')
const applicationData = require('.././../../data/applications.json')

jest.mock('../../../../app/session')
const applications = require('../../../../app/api/applications')
jest.mock('../../../../app/api/applications')
const pagination = require('../../../../app/pagination')
jest.mock('../../../../app/pagination')

pagination.getPagination = jest.fn().mockReturnValue({
  limit: 10, offset: 0
})

pagination.getPagingData = jest.fn().mockReturnValue({
  page: 1, totalPages: 1, total: 1, limit: 10, url: undefined
})
applications.getApplications = jest.fn().mockReturnValue(applicationData)

describe('Applications test', () => {
  const url = '/applications'
  jest.mock('../../../../app/auth')
  const auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: 'test user' } }
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
      expect($('h1.govuk-heading-l').text()).toEqual('Annual health and welfare review agreements')
      expect($('title').text()).toContain('AHWR Applications')
      expect(sessionMock.getAppSearch).toHaveBeenCalledTimes(5)
      expectPhaseBanner.ok($)
    })

    test('returns 200 with query parameter', async () => {
      const options = {
        method: 'GET',
        url: `${url}?page=1`,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('Annual health and welfare review agreements')
      expect($('title').text()).toContain('AHWR Applications')
      expect($('span.govuk-tag--green').text()).toContain('AGREED')
      expect($('span.govuk-tag--yellow').text()).toContain('DATA INPUTTED')
      expect($('span.govuk-tag--orange').text()).toContain('CHECK')
      expect($('span.govuk-tag--blue').text()).toContain('PAID')
      expect($('span.govuk-tag--purple').text()).toContain('ACCEPTED')
      expect($('span.govuk-tag--blue').text()).toContain('CLAIMED')
      expect($('span.govuk-tag--grey').text()).toContain('WITHDRAWN')
      expect($('span.govuk-tag--red').text()).toContain('REJECTED')
      expect($('th[aria-sort="none"]').text()).toContain('SBI')
      expect($('th[aria-sort="none"]').text()).toContain('Status')
      expect($('th[aria-sort="none"]').text()).toContain('Apply date')
      expect(sessionMock.getAppSearch).toBeCalled()
      expect(applications.getApplications).toBeCalled()
      expect(pagination.getPagination).toBeCalled()
      expect(pagination.getPagination).toHaveBeenCalledWith(1)
      expect(pagination.getPagingData).toBeCalled()
      expect(pagination.getPagingData).toHaveBeenCalledWith(9, 10, 1, '')
      expectPhaseBanner.ok($)
    })
    test('returns 200 with query parameter page 2 with sort', async () => {
      let options = {
        method: 'GET',
        url: '/applications/sort/SBI/descending',
        auth
      }
      let res = await global.__SERVER__.inject(options)
      options = {
        method: 'GET',
        url: `${url}?page=2`,
        auth
      }
      res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('th[aria-sort="none"]').text()).toContain('SBI')
      expect(sessionMock.getAppSearch).toBeCalled()
      expect(applications.getApplications).toBeCalled()
      expect(pagination.getPagination).toBeCalled()
      expect(pagination.getPagination).toHaveBeenCalledWith(2)
      expect(pagination.getPagingData).toBeCalled()
      expect(pagination.getPagingData).toHaveBeenCalledWith(9, 10, 2, '')
      expectPhaseBanner.ok($)
    })
    test('returns 200 without query parameter', async () => {
      const options = {
        method: 'GET',
        url: `${url}`,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('Annual health and welfare review agreements')
      expect($('title').text()).toContain('AHWR Applications')
      expect($('span.govuk-tag--green').text()).toContain('AGREED')
      expect($('span.govuk-tag--yellow').text()).toContain('DATA INPUTTED')
      expect($('span.govuk-tag--orange').text()).toContain('CHECK')
      expect($('span.govuk-tag--blue').text()).toContain('PAID')
      expect($('span.govuk-tag--purple').text()).toContain('ACCEPTED')
      expect($('span.govuk-tag--blue').text()).toContain('CLAIMED')
      expect($('span.govuk-tag--grey').text()).toContain('WITHDRAWN')
      expect($('span.govuk-tag--red').text()).toContain('REJECTED')
      expect(sessionMock.getAppSearch).toBeCalled()
      expect(applications.getApplications).toBeCalled()
      expect(pagination.getPagination).toBeCalled()
      expect(pagination.getPagingData).toBeCalled()
      expectPhaseBanner.ok($)
    })
  })
  describe(`POST ${url} route`, () => {
    let crumb
    const method = 'POST'
    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test('returns 302 no auth', async () => {
      const options = {
        method,
        url,
        payload: { crumb, searchText: '333333333', searchType: 'sbi', submit: 'search' },
        headers: { cookie: `crumb=${crumb}` }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })

    test.each([
      { searchDetails: { searchText: '444444444', searchType: 'sbi' }, status: ['APPLIED', 'DATA INPUTTED'] },
      { searchDetails: { searchText: 'AHWR-555A-FD6E', searchType: 'ref' }, status: ['APPLIED', 'CLAIMED'] },
      { searchDetails: { searchText: 'applied', searchType: 'status' }, status: 'APPLIED' },
      { searchDetails: { searchText: 'data inputted', searchType: 'status' }, status: 'DATA INPUTTED' },
      { searchDetails: { searchText: 'claimed', searchType: 'status' }, status: 'CLAIMED' },
      { searchDetails: { searchText: 'check', searchType: 'status' }, status: 'CHECK' },
      { searchDetails: { searchText: 'accepted', searchType: 'status' }, status: 'ACCEPTED' },
      { searchDetails: { searchText: 'rejected', searchType: 'status' }, status: 'REJECTED' },
      { searchDetails: { searchText: 'paid', searchType: 'status' }, status: 'PAID' },
      { searchDetails: { searchText: 'withdrawn', searchType: 'status' } }
    ])('returns success when post %p', async ({ searchDetails, status }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchText: searchDetails.searchText, status, submit: 'search' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }
      applications.getApplications.mockReturnValue({
        applications: [],
        applicationStatus: [],
        total: 0
      })
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      expect(sessionMock.getAppSearch).toBeCalled()
      expect(sessionMock.setAppSearch).toBeCalled()
      expect(applications.getApplications).toBeCalled()
      expect(pagination.getPagination).toBeCalled()
    })
    test.each([
      { searchDetails: { searchText: '333333333' } },
      { searchDetails: { searchText: '444444443' } },
      { searchDetails: { searchText: 'AHWR-555A-F5D5' } },
      { searchDetails: { searchText: '' } },
      { searchDetails: { searchText: null } },
      { searchDetails: { searchText: undefined } }
    ])('returns success with error message when no data found', async ({ searchDetails }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchText: searchDetails.searchText, status: [], submit: 'search' },
        headers: { cookie: `crumb=${crumb}` },
        auth
      }

      applications.getApplications.mockReturnValue({
        applications: [],
        applicationStatus: [],
        total: 0
      })
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      expect(sessionMock.getAppSearch).toBeCalled()
      expect(sessionMock.setAppSearch).toBeCalled()
      expect(applications.getApplications).toBeCalled()
      expect(pagination.getPagination).toBeCalled()
      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('No Applications found.')
    })
  })
})
