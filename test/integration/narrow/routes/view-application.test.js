const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const applications = require('../../../../app/api/applications')
const { administrator } = require('../../../../app/auth/permissions')
const viewApplicationData = require('.././../../data/view-applications.json')
const reference = 'AHWR-555A-FD4C'

function expectWithdrawLink ($, reference, isWithdrawLinkVisible) {
  if (isWithdrawLinkVisible) {
    expect($('.govuk-link').hasClass)
    const withdrawLink = $('.govuk-link')
    expect(withdrawLink.text()).toMatch('Withdraw')
    expect(withdrawLink.attr('href')).toMatch(`/view-application/${reference}?page=1&withdraw=true`)
  } else {
    expect($('.govuk-link').not.hasClass)
  }
}

function expectComplianceCheckPanel ($, isComplianceCheckPanelVisible) {
  const panelClass = '.govuk-panel__title-s .govuk-!-font-size-36 .govuk-!-margin-top-1'
  const approveClaimButtonClass = '.govuk-button .govuk-button .govuk-!-margin-bottom-3'
  const rejectClaimButtonClass = '.govuk-button. govuk-button--secondary .govuk-!-margin-bottom-3'

  if (isComplianceCheckPanelVisible) {
    expect($(panelClass).hasClass)
    expect($(approveClaimButtonClass).hasClass)
    expect($(rejectClaimButtonClass).hasClass)
  } else {
    expect($(panelClass).not.hasClass)
    expect($(approveClaimButtonClass).not.hasClass)
    expect($(rejectClaimButtonClass).not.hasClass)
  }
}

jest.mock('../../../../app/api/applications')

describe('View Application test', () => {
  const url = `/view-application/${reference}`
  jest.mock('../../../../app/auth')
  let auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }

  beforeAll(() => {
    jest.clearAllMocks()

    jest.mock('../../../../app/config', () => ({
      ...jest.requireActual('../../../../app/config'),
      agreementWithdrawl: {
        enabled: true
      }
    }))
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
    test.each([
      ['administrator', true],
      ['processor', false],
      ['user', false]
    ])('Withdrawl link feature flag enabled, link displayed as expected for role %s', async (authScope, isWithdrawLinkVisible) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope] } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.agreed)
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expectWithdrawLink($, reference, isWithdrawLinkVisible)
    })
    test.each([
      ['administrator', false],
      ['processor', false],
      ['user', false]
    ])('Withdrawl link feature flag disabled, link not displayed for role %s', async (authScope, isWithdrawLinkVisible) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope] } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.agreed)
      jest.clearAllMocks()
      jest.mock('../../../../app/config', () => ({
        ...jest.requireActual('../../../../app/config'),
        agreementWithdrawl: {
          enabled: false
        }
      }))
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expectWithdrawLink($, reference, isWithdrawLinkVisible)
    })
    test.each([
      ['administrator', true],
      ['processor', false],
      ['user', false]
    ])('Compliance checks feature flag enabled, authorisation panel displayed as expected for role %s', async (authScope, isComplianceCheckPanelVisible) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope] } }
      jest.clearAllMocks()
      jest.mock('../../../../app/config', () => ({
        ...jest.requireActual('../../../../app/config'),
        complianceChecks: {
          enabled: true
        }
      }))
      applications.getApplication.mockReturnValueOnce(viewApplicationData.incheck)
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expectComplianceCheckPanel($, isComplianceCheckPanelVisible)
    })
    test.each([
      ['administrator', false],
      ['processor', false],
      ['user', false]
    ])('Compliance checks feature flag disabled, authorisation panel not displayed for role %s', async (authScope, isComplianceCheckPanelVisible) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope] } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.incheck)
      jest.clearAllMocks()
      jest.mock('../../../../app/config', () => ({
        ...jest.requireActual('../../../../app/config'),
        complianceChecks: {
          enabled: false
        }
      }))
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expectComplianceCheckPanel($, isComplianceCheckPanelVisible)
    })
    test.each([
      ['administrator', true],
      ['processor', false],
      ['user', false]
    ])('returns 200 application agreed - %s role', async (authScope, isWithdrawLinkVisible) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope] } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.agreed)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-caption-l').text()).toContain(`Agreement number: ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain('Agreed')
      expect($('title').text()).toContain('Administration: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(4)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Name:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('Farmer name')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(3).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(3).text()).toMatch('test@test.com')

      expect($('tbody tr:nth-child(1)').text()).toContain('Date of agreement')
      expect($('tbody tr:nth-child(1)').text()).toContain('06/06/2022')
      expect($('tbody tr:nth-child(2)').text()).toContain('Business details correct')
      expect($('tbody tr:nth-child(2)').text()).toContain('Yes')
      expect($('tbody tr:nth-child(3)').text()).toContain('Type of review')
      expect($('tbody tr:nth-child(3)').text()).toContain('Sheep')
      expect($('tbody tr:nth-child(4)').text()).toContain('Number of livestock')
      expect($('tbody tr:nth-child(4)').text()).toContain('Minimum 21')
      expect($('tbody tr:nth-child(5)').text()).toContain('Agreement accepted')
      expect($('tbody tr:nth-child(5)').text()).toContain('Yes')
      expect($('#claim').text()).toContain('Not claimed yet')

      expectWithdrawLink($, reference, isWithdrawLinkVisible)

      expectPhaseBanner.ok($)
    })
    test('returns 200 application applied', async () => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.notagreed)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-caption-l').text()).toContain(`Agreement number: ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain('Not agreed')
      expect($('title').text()).toContain('Administration: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(4)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Name:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('Farmer name')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(3).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(3).text()).toMatch('test@test.com')

      expect($('tbody tr:nth-child(1)').text()).toContain('Date agreement rejected')
      expect($('tbody tr:nth-child(1)').text()).toContain('06/06/2022')
      expect($('tbody tr:nth-child(2)').text()).toContain('Business details correct')
      expect($('tbody tr:nth-child(2)').text()).toContain('Yes')
      expect($('tbody tr:nth-child(3)').text()).toContain('Type of review')
      expect($('tbody tr:nth-child(3)').text()).toContain('Sheep')
      expect($('tbody tr:nth-child(4)').text()).toContain('Number of livestock')
      expect($('tbody tr:nth-child(4)').text()).toContain('Minimum 21')
      expect($('tbody tr:nth-child(5)').text()).toContain('Agreement accepted')
      expect($('tbody tr:nth-child(5)').text()).toContain('No')
      expect($('#claim').text()).toContain('Not eligible to claim')

      expectWithdrawLink($, reference, false)

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
      expect($('h1.govuk-caption-l').text()).toContain(`Agreement number: ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain('Data inputted')
      expect($('title').text()).toContain('Administration: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(4)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Name:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('Farmer name')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(3).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(3).text()).toMatch('test@test.com')

      expect($('#claim').text()).toContain('Not eligible to claim')

      expectWithdrawLink($, reference, false)

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
      expect($('h1.govuk-caption-l').text()).toContain(`Agreement number: ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain('Claimed')
      expect($('title').text()).toContain('Administration: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(4)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Name:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('Farmer name')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(3).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(3).text()).toMatch('test@test.com')

      expect($('#claim').text()).toContain('Claimed')

      expect($('tbody:nth-child(1) tr:nth-child(1)').text()).toContain('Date of review')
      expect($('tbody:nth-child(1) tr:nth-child(1)').text()).toContain('07/11/2022')
      expect($('tbody:nth-child(1) tr:nth-child(2)').text()).toContain('Date of claim')
      expect($('tbody:nth-child(1) tr:nth-child(2)').text()).toContain('07/12/2022')
      expect($('tbody:nth-child(1) tr:nth-child(3)').text()).toContain('Review details confirmed')
      expect($('tbody:nth-child(1) tr:nth-child(3)').text()).toContain('Yes')
      expect($('tbody:nth-child(1) tr:nth-child(4)').text()).toContain('Vet’s name')
      expect($('tbody:nth-child(1) tr:nth-child(4)').text()).toContain('testVet')
      expect($('tbody:nth-child(1) tr:nth-child(5)').text()).toContain('Vet’s RCVS number')
      expect($('tbody:nth-child(1) tr:nth-child(5)').text()).toContain('1234234')
      expect($('tbody:nth-child(1) tr:nth-child(6)').text()).toContain('Test results unique reference number (URN)')
      expect($('tbody:nth-child(1) tr:nth-child(6)').text()).toContain('134242')

      expectWithdrawLink($, reference, false)

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
      expect($('h1.govuk-caption-l').text()).toContain(`Agreement number: ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain('Accepted')
      expect($('title').text()).toContain('Administration: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(4)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Name:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('Farmer name')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(3).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(3).text()).toMatch('test@test.com')

      expect($('#claim').text()).toContain('Claimed')

      expectWithdrawLink($, reference, false)

      expectPhaseBanner.ok($)
    })
    test.each([
      ['administrator', true],
      ['processor', false],
      ['user', false]
    ])('returns 200 application in check - %s role', async (authScope, isWithdrawLinkVisible) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope] } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.incheck)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-caption-l').text()).toContain(`Agreement number: ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain('In check')
      expect($('title').text()).toContain('Administration: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(4)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Name:')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('Farmer name')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(3).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(3).text()).toMatch('test@test.com')

      expect($('tbody tr:nth-child(1)').text()).toContain('Date of agreement')
      expect($('tbody tr:nth-child(1)').text()).toContain('06/06/2022')
      expect($('tbody tr:nth-child(2)').text()).toContain('Business details correct')
      expect($('tbody tr:nth-child(2)').text()).toContain('Yes')
      expect($('tbody tr:nth-child(3)').text()).toContain('Type of review')
      expect($('tbody tr:nth-child(3)').text()).toContain('Sheep')
      expect($('tbody tr:nth-child(4)').text()).toContain('Number of livestock')
      expect($('tbody tr:nth-child(4)').text()).toContain('Minimum 21')
      expect($('tbody tr:nth-child(5)').text()).toContain('Agreement accepted')
      expect($('tbody tr:nth-child(5)').text()).toContain('Yes')
      expect($('#claim').text()).toContain('Not claimed yet')

      expectPhaseBanner.ok($)
    })
  })
})
