const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const applications = require('../../../../app/api/applications')
const { administrator } = require('../../../../app/auth/permissions')
const viewApplicationData = require('.././../../data/view-applications.json')
const reference = 'VV-555A-FD4C'

jest.mock('../../../../app/api/applications')

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
      expect($('title').text()).toContain('Administration: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(3)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('test@test.com')

      expect($('tbody tr:nth-child(1) td:nth-child(2)').text()).toContain('Detail correct?')
      expect($('tbody tr:nth-child(2) td:nth-child(3)').text()).toContain('Sheep')
      expect($('tbody tr:nth-child(3) td:nth-child(3)').text()).toContain('At least 21')
      expect($('tbody tr:nth-child(4) td:nth-child(2)').text()).toContain('T&Cs agreed?')
      expect($('tbody tr:nth-child(4) td:nth-child(3)').text()).toContain('Yes')
      expect($('#claim').text()).toContain('Not yet able to claim')
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
      expect($('title').text()).toContain('Administration: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(3)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('test@test.com')

      expect($('#claim').text()).toContain('Not yet able to claim')
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
      expect($('title').text()).toContain('Administration: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(3)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('test@test.com')

      expect($('#claim').text()).toContain('Selected for fraud check')
      expect($('tbody:nth-child(2) tr:nth-child(1) td:nth-child(2)').text()).toContain('Details correct?')
      expect($('tbody:nth-child(2) tr:nth-child(1) td:nth-child(3)').text()).toContain('Yes')
      expect($('tbody:nth-child(2) tr:nth-child(2) td:nth-child(2)').text()).toContain('Date of review')
      expect($('tbody:nth-child(2) tr:nth-child(2) td:nth-child(3)').text()).toContain('07/11/2022')
      expect($('tbody:nth-child(2) tr:nth-child(3) td:nth-child(2)').text()).toContain('Vet’s name')
      expect($('tbody:nth-child(2) tr:nth-child(3) td:nth-child(3)').text()).toContain('testVet')
      expect($('tbody:nth-child(2) tr:nth-child(4) td:nth-child(2)').text()).toContain('Vet’s RCVS number')
      expect($('tbody:nth-child(2) tr:nth-child(4) td:nth-child(3)').text()).toContain('1234234')
      expect($('tbody:nth-child(2) tr:nth-child(5) td:nth-child(2)').text()).toContain('Unique reference number (URN)')
      expect($('tbody:nth-child(2) tr:nth-child(5) td:nth-child(3)').text()).toContain('134242')
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
      expect($('title').text()).toContain('Administration: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(3)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('test@test.com')

      expect($('#claim').text()).toContain('Selected for fraud check')
      expectPhaseBanner.ok($)
    })
  })
})
