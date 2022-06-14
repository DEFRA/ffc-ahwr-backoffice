const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const getCrumbs = require('../../../utils/get-crumbs')

const sessionMock = require('../../../../app/session')
jest.mock('../../../../app/session')
jest.mock('../../../../app/messaging')
const applications = require('../../../../app/messaging/applications')
jest.mock('../../../../app/messaging/applications')

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
  })

  describe(`POST ${url} route`, () => {
    let crumb
    const method = 'POST'
    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { searchDetails: { searchText: '444444444', searchType: 'sbi' } },
      { searchDetails: { searchText: '444444443', searchType: 'sbi' } }
    ])('returns success when post', async ({ searchDetails }) => {
      const options = {
        method,
        url,
        payload: { crumb, searchText: searchDetails.searchText, searchType: searchDetails.searchType },
        headers: { cookie: `crumb=${crumb}` }
      }

      // sessionMock.getAppSearch.mockReturnValue(searchDetails)
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
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
