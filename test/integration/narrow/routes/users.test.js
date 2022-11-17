const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const getCrumbs = require('../../../utils/get-crumbs')
const { administrator } = require('../../../../app/auth/permissions')
const sessionMock = require('../../../../app/session')
const usersData = require('.././../../data/users.json')

jest.mock('../../../../app/session')
const users = require('../../../../app/api/users')
jest.mock('../../../../app/api/users')
jest.mock('../../../../app/pagination')

users.getUsers = jest.fn().mockReturnValue(usersData)
users.sortUsers = jest.fn().mockReturnValue(usersData)
users.searchForUser = jest.fn().mockReturnValue(usersData)

describe('Users test', () => {
  const url = '/users'
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
      expect($('h1.govuk-heading-l').text()).toEqual('Annual health and welfare review users')
      expect($('title').text()).toContain('AHWR Users')
      expect(sessionMock.getUserSearch).toHaveBeenCalledTimes(4)
      expectPhaseBanner.ok($)
    })

    test('returns 200 with sort', async () => {
      let options = {
        method: 'GET',
        url: '/users/sort/SBI/descending',
        auth
      }
      let res = await global.__SERVER__.inject(options)
      options = {
        method: 'GET',
        url: `${url}`,
        auth
      }
      res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('th[aria-sort="none"]').text()).toContain('SBI')
      expect(sessionMock.getUserSearch).toBeCalled()
      expect(users.getUsers).toBeCalled()
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
      expect($('h1.govuk-heading-l').text()).toEqual('Annual health and welfare review users')
      expect($('title').text()).toContain('AHWR Users')
      expect(sessionMock.getUserSearch).toBeCalled()
      expect(users.getUsers).toBeCalled()
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
      { searchDetails: { searchText: '444444444', searchType: 'sbi' } }
      // { searchDetails: { searchText: 'VV-555A-FD6E', searchType: 'ref' }, status: ['APPLIED', 'CLAIMED'] },
      // { searchDetails: { searchText: 'applied', searchType: 'status' }, status: 'APPLIED' },
      // { searchDetails: { searchText: 'data inputted', searchType: 'status' }, status: 'DATA INPUTTED' },
      // { searchDetails: { searchText: 'claimed', searchType: 'status' }, status: 'CLAIMED' },
      // { searchDetails: { searchText: 'check', searchType: 'status' }, status: 'CHECK' },
      // { searchDetails: { searchText: 'accepted', searchType: 'status' }, status: 'ACCEPTED' },
      // { searchDetails: { searchText: 'rejected', searchType: 'status' }, status: 'REJECTED' },
      // { searchDetails: { searchText: 'paid', searchType: 'status' }, status: 'PAID' },
      // { searchDetails: { searchText: 'withdrawn', searchType: 'status' } }
    ])('returns success when post %p', async ({ searchDetails, status }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchText: searchDetails.searchText, status, submit: 'search' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }
      users.getUsers.mockReturnValue(usersData)
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      expect(sessionMock.getUserSearch).toBeCalled()
      expect(sessionMock.setUserSearch).toBeCalled()
      expect(users.getUsers).toBeCalled()
    })

    // test.each([
    //   { searchDetails: { searchText: '333333333' } },
    //   { searchDetails: { searchText: '444444443' } },
    //   { searchDetails: { searchText: 'VV-555A-F5D5' } },
    //   { searchDetails: { searchText: '' } },
    //   { searchDetails: { searchText: null } },
    //   { searchDetails: { searchText: undefined } }
    // ])('returns success with error message when no data found', async ({ searchDetails }) => {
    //   const options = {
    //     method,
    //     url,
    //     payload: { crumb, searchText: searchDetails.searchText, status: [], submit: 'search' },
    //     headers: { cookie: `crumb=${crumb}` },
    //     auth
    //   }

    //   applications.getApplications.mockReturnValue({
    //     applications: [],
    //     applicationStatus: [],
    //     total: 0
    //   })
    //   const res = await global.__SERVER__.inject(options)

    //   expect(res.statusCode).toBe(200)
    //   expect(sessionMock.getAppSearch).toBeCalled()
    //   expect(sessionMock.setAppSearch).toBeCalled()
    //   expect(applications.getApplications).toBeCalled()
    //   expect(pagination.getPagination).toBeCalled()
    //   const $ = cheerio.load(res.payload)
    //   expect($('p.govuk-error-message').text()).toMatch('No Applications found.')
    // })

    // test.each([
    //   { searchDetails: { searchText: '1233' } },
    //   { searchDetails: { searchText: 'sdfgsfgsd' } }
    // ])('returns error', async ({ searchDetails }) => {
    //   const options = {
    //     method,
    //     url,
    //     payload: { crumb, searchText: searchDetails.searchText, status: [] },
    //     auth,
    //     headers: { cookie: `crumb=${crumb}` }
    //   }

    //   const res = await global.__SERVER__.inject(options)

    //   const $ = cheerio.load(res.payload)
    //   expect($('p.govuk-error-message').text()).toMatch('Error: Invalid search. It should be application reference or status or sbi number.')
    //   expect(res.statusCode).toBe(400)
    // })
  })
})
