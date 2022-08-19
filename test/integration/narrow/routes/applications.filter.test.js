const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
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
sessionMock.getAppSearch = jest.fn().mockReturnValue([]).mockReturnValueOnce(['PENDING', 'APPLIED', 'DATA INPUTTED', 'CLAIMED'])
describe('Applications Filter test', () => {
  const url = '/applications/remove'
  jest.mock('../../../../app/auth')
  const auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }
  const method = 'GET'
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe(`GET ${url} route`, () => {
    test('returns 302 no auth', async () => {
      const options = {
        method,
        url: `${url}/PENDING`
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })
    test('returns 200', async () => {
      const options = {
        method,
        url: `${url}/PENDING`,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('AHWR Applications')
      expect($('title').text()).toContain('AHWR Applications')
      expect(sessionMock.getAppSearch).toHaveBeenCalledTimes(6)
      expect(sessionMock.setAppSearch).toHaveBeenCalledTimes(1)
      expectPhaseBanner.ok($)
    })
    test('returns 200 with selected status', async () => {
      const options = {
        method,
        url: `${url}/PENDING`,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('govuk-checkboxes__input').filter(s => s.value === 'APPLIED')).toBeTruthy()
      expect(sessionMock.getAppSearch).toHaveBeenCalledTimes(6)
      expect(sessionMock.setAppSearch).toHaveBeenCalledTimes(1)
      expectPhaseBanner.ok($)
    })
  })

  describe('GET /applications/clear route', () => {
    test('returns 302 no auth', async () => {
      const options = {
        method,
        url: '/applications/clear'
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })
    test('returns 200', async () => {
      const options = {
        method,
        url: '/applications/clear',
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('AHWR Applications')
      expect($('title').text()).toContain('AHWR Applications')
      expect(sessionMock.getAppSearch).toHaveBeenCalledTimes(5)
      expect(sessionMock.setAppSearch).toHaveBeenCalledTimes(1)
      expectPhaseBanner.ok($)
    })
  })

  describe('GET /applications/sort route', () => {
    test('returns 302 no auth', async () => {
      const options = {
        method,
        url: '/applications/sort/sbi/ascending'
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })
    test('returns 200', async () => {
      const options = {
        method,
        url: '/applications/sort/sbi/ascending',
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      expect(res.payload).toEqual('1')
      expect(sessionMock.getAppSearch).toHaveBeenCalledTimes(0)
      expect(sessionMock.setAppSearch).toHaveBeenCalledTimes(1)
    })
  })
})
