const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const getCrumbs = require('../../../utils/get-crumbs')

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
  applicationState: 'submitted',
  applications: [{
    id: '555afd4c-b095-4ce4-b492-800466b53393',
    reference: 'VV-555A-FD4C',
    status: 1,
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
    status: 2,
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
    status: 3,
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
    status: 4,
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
  describe(`GET ${url} route`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url
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
        url: `${url}?page=1`
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('Applications')
      expect($('title').text()).toContain('Applications')
      expect($('span.govuk-tag--grey').text()).toContain('In Progress')
      expect($('span.govuk-tag--blue').text()).toContain('Submitted')
      expect($('span.govuk-tag--red').text()).toContain('Withdrawn')
      expect($('span.govuk-tag--red').text()).toContain('Deleted')
      expect(sessionMock.getAppSearch).toBeCalled()
      expect(applications.getApplications).toBeCalled()
      expect(pagination.getPagination).toBeCalled()
      expect(pagination.getPagingData).toBeCalled()
      expectPhaseBanner.ok($)
    })
    test('returns 200 without query parameter', async () => {
      const options = {
        method: 'GET',
        url: `${url}`
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('Applications')
      expect($('title').text()).toContain('Applications')
      expect($('span.govuk-tag--grey').text()).toContain('In Progress')
      expect($('span.govuk-tag--blue').text()).toContain('Submitted')
      expect($('span.govuk-tag--red').text()).toContain('Withdrawn')
      expect($('span.govuk-tag--red').text()).toContain('Deleted')
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

    test.each([
      { searchDetails: { searchText: '444444444', searchType: 'sbi' } },
      { searchDetails: { searchText: '444444443', searchType: 'sbi' } },
      { searchDetails: { searchText: undefined, searchType: undefined } }
    ])('returns success when post', async ({ searchDetails }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchText: searchDetails.searchText, searchType: searchDetails.searchType },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      expect(sessionMock.getAppSearch).toBeCalled()
      expect(sessionMock.setAppSearch).toBeCalled()
      expect(applications.getApplications).toBeCalled()
      expect(pagination.getPagination).toBeCalled()
      expect(pagination.getPagingData).toBeCalled()
    })
    test.each([
      { searchDetails: { searchText: '444444443', searchType: 'sbi' } }
    ])('returns success with error message when no data found', async ({ searchDetails }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchText: searchDetails.searchText, searchType: searchDetails.searchType },
        headers: { cookie: `crumb=${crumb}` }
      }

      applications.getApplications.mockReturnValue({
        applicationState: 'not_found',
        applications: []
      })
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      expect(sessionMock.getAppSearch).toBeCalled()
      expect(sessionMock.setAppSearch).toBeCalled()
      expect(applications.getApplications).toBeCalled()
      expect(pagination.getPagination).toBeCalled()
      expect(pagination.getPagingData).toBeCalled()
      const $ = cheerio.load(res.payload)
      expect($('h2.govuk-error-summary__title').text()).toMatch('No Applications found.')
    })

    test.each([
      { searchDetails: { searchText: null, searchType: 'sbi' } },
      { searchDetails: { searchText: undefined, searchType: 'sbi' } },
      { searchDetails: { searchText: '1233', searchType: 'sbi' } },
      { searchDetails: { searchText: '', searchType: 'sbi' } },
      { searchDetails: { searchText: 'sdfgsfgsd', searchType: 'sbi' } }
    ])('returns error', async ({ searchDetails }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchDetails },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('')
      expect(res.statusCode).toBe(400)
    })
  })
})
