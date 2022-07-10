const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const applications = require('../../../../app/messaging/applications')
const { administrator } = require('../../../../app/auth/permissions')
const viewApplicationData = require('.././../../data/view-applications.json')
const reference = 'VV-555A-FD4C'

jest.mock('../../../../app/messaging/applications')

describe('View Application test', () => {
  const url = `/view-application/${reference}`
  jest.mock('../../../../app/auth')
  const auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe(`GET ${url} route`, () => {
    test('returns 302 no auth', async () => {
      const options = {
        method: 'GET',
        url
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })
    test('returns 400', async () => {
      applications.getApplication.mockReturnValueOnce(null)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('400 - Bad Request')
      expectPhaseBanner.ok($)
    })
    test('returns 200 application applied', async () => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.applied)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-caption-l').text()).toContain(`Application ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain('APPLIED')
      expect($('title').text()).toContain('Back office: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(3)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('test@test.com')

      expect($('#vet-review').text()).toContain('Not yet reviewed')
      expect($('#claim').text()).toContain('Not yet able to claim')
      expect($('#payment').text()).toContain('Not yet paid')
      expectPhaseBanner.ok($)
    })
    test('returns 200 application data inputted', async () => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.dataInputted)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-caption-l').text()).toContain(`Application ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain('DATA INPUTTED')
      expect($('title').text()).toContain('Back office: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(3)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('test@test.com')

      expect($('#vet-review').text()).toContain('Data inputted')
      expect($('#claim').text()).toContain('Not yet able to claim')
      expect($('#payment').text()).toContain('Not yet paid')
      expectPhaseBanner.ok($)
    })
    test('returns 200 application claim', async () => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.claim)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-caption-l').text()).toContain(`Application ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain('CLAIMED')
      expect($('title').text()).toContain('Back office: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(3)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('test@test.com')

      expect($('#vet-review').text()).toContain('Data inputted')
      expect($('#claim').text()).toContain('Selected for fraud check')
      expect($('#payment').text()).toContain('Not yet paid')
      expectPhaseBanner.ok($)
    })
    test('returns 200 application paid', async () => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.paid)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-caption-l').text()).toContain(`Application ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain('ACCEPTED')
      expect($('title').text()).toContain('Back office: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(3)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('test@test.com')

      expect($('#vet-review').text()).toContain('Data inputted')
      expect($('#claim').text()).toContain('Selected for fraud check')
      expect($('#payment').text()).toContain('Payment information')
      expectPhaseBanner.ok($)
    })
  })
})
