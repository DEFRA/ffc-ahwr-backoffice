const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const getCrumbs = require('../../../utils/get-crumbs')
const { administrator } = require('../../../../app/auth/permissions')
const sessionMock = require('../../../../app/session')

jest.mock('../../../../app/session')
jest.mock('../../../../app/messaging')
const applications = require('../../../../app/messaging/applications')
jest.mock('../../../../app/messaging/applications')
const pagination = require('../../../../app/pagination')
jest.mock('../../../../app/pagination')

pagination.getPagination = jest.fn().mockReturnValue({
  limit: 10, offset: 0
})

pagination.getPagingData = jest.fn().mockReturnValue({
  page: 1, totalPages: 1, total: 1, limit: 10, url: undefined
})
applications.getApplications = jest.fn().mockReturnValue({
  total: 4,
  applications: [{
    id: '555afd4c-b095-4ce4-b492-800466b53393',
    reference: 'VV-555A-FD4C',
    status: { status: 'APPLIED' },
    data: {
      declaration: true,
      whichReview: 'sheep',
      organisation: {
        cph: '33/333/3333',
        sbi: '333333333',
        name: 'My Farm',
        email: 'test@test.com',
        isTest: true,
        address: 'Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC'
      },
      eligibleSpecies: 'yes',
      confirmCheckDetails: 'yes'
    },
    claimed: false,
    createdAt: '2022-06-06T14:27:51.251Z',
    updatedAt: '2022-06-06T14:27:51.775Z',
    createdBy: 'admin'
  }, {
    id: '555afd4c-b095-4ce4-b492-800466b54493',
    reference: 'VV-555A-FD4D',
    status: { status: 'REJECTED' },
    data: {
      declaration: true,
      whichReview: 'sheep',
      organisation: {
        cph: '33/333/3333',
        sbi: '333333333',
        name: 'My Farm',
        email: 'test@test.com',
        isTest: true,
        address: 'Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC'
      },
      eligibleSpecies: 'yes',
      confirmCheckDetails: 'yes'
    },
    claimed: false,
    createdAt: '2022-06-06T14:27:51.251Z',
    updatedAt: '2022-06-06T14:27:51.775Z',
    createdBy: 'admin'
  }, {
    id: '555afd4c-b095-4ce4-b492-800466b55593',
    reference: 'VV-555A-FD5D',
    status: { status: 'DATA INPUTED' },
    data: {
      declaration: true,
      whichReview: 'sheep',
      organisation: {
        cph: '33/333/3333',
        sbi: '333333333',
        name: 'My Farm',
        email: 'test@test.com',
        isTest: true,
        address: 'Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC'
      },
      eligibleSpecies: 'yes',
      confirmCheckDetails: 'yes'
    },
    claimed: false,
    createdAt: '2022-06-06T14:27:51.251Z',
    updatedAt: '2022-06-06T14:27:51.775Z',
    createdBy: 'admin'
  }, {
    id: '555afd4c-b095-4ce4-b492-800466b66693',
    reference: 'VV-555A-FD6E',
    status: { status: 'WITHDRAWN' },
    data: {
      declaration: true,
      whichReview: 'sheep',
      organisation: {
        cph: '33/333/3333',
        sbi: '333333333',
        name: 'My Farm',
        email: 'test@test.com',
        isTest: true,
        address: 'Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC'
      },
      eligibleSpecies: 'yes',
      confirmCheckDetails: 'yes'
    },
    claimed: false,
    createdAt: '2022-06-06T14:27:51.251Z',
    updatedAt: '2022-06-06T14:27:51.775Z',
    createdBy: 'admin'
  }, {
    id: '555afd4c-b095-4ce4-b492-800466b66693',
    reference: 'VV-666A-FD6E',
    status: { status: 'ACCEPTED' },
    data: {
      declaration: true,
      whichReview: 'sheep',
      organisation: {
        cph: '33/333/3333',
        sbi: '333333333',
        name: 'My Farm',
        email: 'test@test.com',
        isTest: true,
        address: 'Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC'
      },
      eligibleSpecies: 'yes',
      confirmCheckDetails: 'yes'
    },
    claimed: false,
    createdAt: '2022-06-06T14:27:51.251Z',
    updatedAt: '2022-06-06T14:27:51.775Z',
    createdBy: 'admin'
  }, {
    id: '555afd4c-b095-4ce4-b492-800466b78693',
    reference: 'VV-666A-FD7E',
    status: { status: 'CHECK' },
    data: {
      declaration: true,
      whichReview: 'sheep',
      organisation: {
        cph: '33/333/3333',
        sbi: '333333333',
        name: 'My Farm',
        email: 'test@test.com',
        isTest: true,
        address: 'Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC'
      },
      eligibleSpecies: 'yes',
      confirmCheckDetails: 'yes'
    },
    claimed: false,
    createdAt: '2022-06-06T14:27:51.251Z',
    updatedAt: '2022-06-06T14:27:51.775Z',
    createdBy: 'admin'
  }, {
    id: '555afd4c-b095-4ce4-b492-800466b88893',
    reference: 'VV-666A-AB6E',
    status: { status: 'CLAIMED' },
    data: {
      declaration: true,
      whichReview: 'sheep',
      organisation: {
        cph: '33/333/3333',
        sbi: '333333333',
        name: 'My Farm',
        email: 'test@test.com',
        isTest: true,
        address: 'Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC'
      },
      eligibleSpecies: 'yes',
      confirmCheckDetails: 'yes'
    },
    claimed: false,
    createdAt: '2022-06-06T14:27:51.251Z',
    updatedAt: '2022-06-06T14:27:51.775Z',
    createdBy: 'admin'
  }, {
    id: '555afd4c-b095-4ce4-b492-800466b90993',
    reference: 'VV-666A-RG6E',
    status: { status: 'PAID' },
    data: {
      declaration: true,
      whichReview: 'sheep',
      organisation: {
        cph: '33/333/3333',
        sbi: '333333333',
        name: 'My Farm',
        email: 'test@test.com',
        isTest: true,
        address: 'Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC'
      },
      eligibleSpecies: 'yes',
      confirmCheckDetails: 'yes'
    },
    claimed: false,
    createdAt: '2022-06-06T14:27:51.251Z',
    updatedAt: '2022-06-06T14:27:51.775Z',
    createdBy: 'admin'
  }, {
    id: '555afd4c-b095-4ce4-b492-800466b10993',
    reference: 'VV-666A-RG7E',
    status: { status: 'ACCEPTED' },
    data: {
      declaration: true,
      whichReview: 'sheep',
      organisation: {
        cph: '33/333/3333',
        sbi: '333333333',
        name: 'My Farm',
        email: 'test@test.com',
        isTest: true,
        address: 'Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC'
      },
      eligibleSpecies: 'yes',
      confirmCheckDetails: 'yes'
    },
    claimed: false,
    createdAt: '2022-06-06T14:27:51.251Z',
    updatedAt: '2022-06-06T14:27:51.775Z',
    createdBy: 'admin'
  }]
})

describe('Applications test', () => {
  const url = '/applications'
  jest.mock('../../../../app/auth')
  const auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }
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
      expect($('h1.govuk-heading-l').text()).toEqual('Applications')
      expect($('title').text()).toContain('Applications')
      expect(sessionMock.getAppSearch).toHaveBeenCalledTimes(2)
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
      expect($('h1.govuk-heading-l').text()).toEqual('Applications')
      expect($('title').text()).toContain('Applications')
      expect($('span.govuk-tag--grey').text()).toContain('APPLIED')
      expect($('span.govuk-tag--blue').text()).toContain('DATA INPUTED')
      expect($('span.govuk-tag--blue').text()).toContain('CHECK')
      expect($('span.govuk-tag--blue').text()).toContain('PAID')
      expect($('span.govuk-tag--blue').text()).toContain('ACCEPTED')
      expect($('span.govuk-tag--blue').text()).toContain('CLAIMED')
      expect($('span.govuk-tag--red').text()).toContain('WITHDRAWN')
      expect($('span.govuk-tag--red').text()).toContain('REJECTED')
      expect(sessionMock.getAppSearch).toBeCalled()
      expect(applications.getApplications).toBeCalled()
      expect(pagination.getPagination).toBeCalled()
      expect(pagination.getPagingData).toBeCalled()
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
      expect($('h1.govuk-heading-l').text()).toEqual('Applications')
      expect($('title').text()).toContain('Applications')
      expect($('span.govuk-tag--grey').text()).toContain('APPLIED')
      expect($('span.govuk-tag--blue').text()).toContain('DATA INPUTED')
      expect($('span.govuk-tag--blue').text()).toContain('CHECK')
      expect($('span.govuk-tag--blue').text()).toContain('PAID')
      expect($('span.govuk-tag--blue').text()).toContain('ACCEPTED')
      expect($('span.govuk-tag--blue').text()).toContain('CLAIMED')
      expect($('span.govuk-tag--red').text()).toContain('WITHDRAWN')
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
        payload: { crumb, searchText: '333333333', searchType: 'sbi' },
        headers: { cookie: `crumb=${crumb}` }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })

    test.each([
      { searchDetails: { searchText: '444444444', searchType: 'sbi' } },
      { searchDetails: { searchText: 'VV-555A-FD6E', searchType: 'ref' } },
      { searchDetails: { searchText: 'applied', searchType: 'status' } },
      { searchDetails: { searchText: 'data inputed', searchType: 'status' } },
      { searchDetails: { searchText: 'claimed', searchType: 'status' } },
      { searchDetails: { searchText: 'check', searchType: 'status' } },
      { searchDetails: { searchText: 'accepted', searchType: 'status' } },
      { searchDetails: { searchText: 'rejected', searchType: 'status' } },
      { searchDetails: { searchText: 'paid', searchType: 'status' } },
      { searchDetails: { searchText: 'withdrawn', searchType: 'status' } }
    ])('returns success when post %p', async ({ searchDetails }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchText: searchDetails.searchText },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

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
      { searchDetails: { searchText: 'VV-555A-F5D5' } },
      { searchDetails: { searchText: '' } },
      { searchDetails: { searchText: null } },
      { searchDetails: { searchText: undefined } }
    ])('returns success with error message when no data found', async ({ searchDetails }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchText: searchDetails.searchText },
        headers: { cookie: `crumb=${crumb}` },
        auth
      }

      applications.getApplications.mockReturnValue({
        applications: []
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

    test.each([
      { searchDetails: { searchText: '1233' } },
      { searchDetails: { searchText: 'sdfgsfgsd' } }
    ])('returns error', async ({ searchDetails }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchText: searchDetails.searchText },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Error: Invalid search. It should be application reference or status or sbi number.')
      expect(res.statusCode).toBe(400)
    })
  })
})
