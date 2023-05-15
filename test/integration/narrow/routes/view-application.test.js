const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const applications = require('../../../../app/api/applications')
const { administrator } = require('../../../../app/auth/permissions')
const viewApplicationData = require('.././../../data/view-applications.json')
const applicationHistoryData = require('../../../data/application-history.json')
const { when, resetAllWhenMocks } = require('jest-when')
const reference = 'AHWR-555A-FD4C'
let claimFormHelper

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

function expectRecommendButtons ($, areRecommendButtonsVisible) {
  console.log('areRecommendButtonsVisible111', areRecommendButtonsVisible)
  if (areRecommendButtonsVisible) {
    const recommendToPayButton = $('.govuk-button').eq(0)
    const recommendToRejectButton = $('.govuk-button').eq(1)

    expect(recommendToPayButton.hasClass('govuk-button'))
    expect(recommendToPayButton.text()).toMatch('Recommend to pay')
    expect(recommendToPayButton.attr('onclick')).toMatch("location.href=''")

    expect(recommendToRejectButton.hasClass('govuk-button'))
    expect(recommendToRejectButton.text()).toMatch('Recommend to reject')
    expect(recommendToRejectButton.attr('onclick')).toMatch("location.href=''")
  } else {
    expect($('.govuk-button').not.hasClass)
  }
}

function expectComplianceCheckPanel ($, isComplianceCheckPanelVisible) {
  const panelClass = '.govuk-panel__title-s .govuk-!-font-size-36 .govuk-!-margin-top-1'
  const approveClaimButtonClass = '.govuk-button .govuk-button .govuk-!-margin-bottom-3'
  const rejectClaimButtonClass = '.govuk-button. govuk-button--secondary .govuk-!-margin-bottom-3'

  isComplianceCheckPanelVisible ? expect($(panelClass).hasClass) : expect($(panelClass).not.hasClass)
  isComplianceCheckPanelVisible ? expect($(approveClaimButtonClass).hasClass) : expect($(approveClaimButtonClass).not.hasClass)
  isComplianceCheckPanelVisible ? expect($(rejectClaimButtonClass).hasClass) : expect($(rejectClaimButtonClass).not.hasClass)
}

function expectWithdrawConfirmationPanel ($, istWithdrawConfirmationPanelVisible) {
  const panelText = $('h1:contains("Are you sure you want to withdraw?")').text()
  const yesButtonText = $('button:contains("Yes")').text()
  const noButtonText = $('button:contains("No")').text()
  const panelExpectedLength = 34
  const yesButtonExpectedLength = 3
  const noButtonExpectedLength = 2

  istWithdrawConfirmationPanelVisible ? expect(panelText).toHaveLength(panelExpectedLength) : expect(panelText).toHaveLength(0)
  istWithdrawConfirmationPanelVisible ? expect(yesButtonText).toHaveLength(yesButtonExpectedLength) : expect(yesButtonText).toHaveLength(0)
  istWithdrawConfirmationPanelVisible ? expect(noButtonText).toHaveLength(noButtonExpectedLength) : expect(noButtonText).toHaveLength(0)
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
      },
      rbac: {
        enabled: true
      }
    }))
    jest.mock('../../../../app/routes/utils/claim-form-helper')
    claimFormHelper = require('../../../../app/routes/utils/claim-form-helper')

    claimFormHelper.mockReturnValue({
      displayRecommendationForm: false,
      displayRecommendToPayConfirmationForm: false,
      displayRecommendToRejectConfirmationForm: false,
      displayAuthorisationForm: false,
      displayAuthoriseToPayConfirmationForm: false,
      displayAuthoriseToRejectConfirmationForm: false,
      claimSubStatus: null
    })
  })

  afterEach(() => {
    resetAllWhenMocks()
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
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
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
      ['user', false],
      ['recommender', true],
      ['authoriser', false]
    ])('RBAC feature flag enabled, recommend buttons displayed as expected for role %s', async (authScope, areRecommendButtonsVisible) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope] } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.agreed)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      when(claimFormHelper).calledWith(expect.anything(), expect.anything(), expect.anything()).mockReturnValueOnce({
        displayRecommendationForm: true
      })
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)
      expectRecommendButtons($, areRecommendButtonsVisible)
      console.log('got here')
    })

    test.each([
      ['administrator', false],
      ['processor', false],
      ['user', false],
      ['recommender', false],
      ['authoriser', true]
    ])('RBAC feature flag enabled, authorisation form displayed as expected for role %s', async (authScope, authorisePaymentButtonVisible) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope] } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.readytopay)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      when(claimFormHelper).calledWith(expect.anything(), expect.anything(), expect.anything()).mockReturnValueOnce({
        displayAuthorisationForm: authorisePaymentButtonVisible
      })
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      if (authorisePaymentButtonVisible) {
        const authorisePaymentButton = $('#btn-authorise-payment')
        expect(authorisePaymentButton.length).toEqual(1)
        expect(authorisePaymentButton.hasClass('govuk-button'))
        expect(authorisePaymentButton.text().trim()).toEqual('Authorise payment')
        expect($('#pnl-authorise-payment input[name=reference]').attr('value')).toEqual(reference)
      } else {
        expect($('#btn-authorise-payment').length).toEqual(0)
      }
    })

    test.each([
      ['administrator', false],
      ['processor', false],
      ['user', false]
    ])('Withdrawl link feature flag disabled, link not displayed for role %s', async (authScope, isWithdrawLinkVisible) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope] } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.agreed)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
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
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
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
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
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
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
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
      expect($('#application').text()).toContain('Agreed')
      expect($('#claim').text()).toContain('Agreed')

      expectWithdrawLink($, reference, isWithdrawLinkVisible)

      expectPhaseBanner.ok($)
    })
    test('returns 200 application applied', async () => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.notagreed)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
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
      expect($('#application').text()).toContain('Not agreed')
      expect($('#claim').text()).toContain('Not agreed')

      expectWithdrawLink($, reference, false)

      expectPhaseBanner.ok($)
    })
    test('returns 200 application data inputted', async () => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.dataInputted)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
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

      expect($('#application').text()).toContain('Data inputted')
      expect($('#claim').text()).toContain('Data inputted')

      expectWithdrawLink($, reference, false)

      expectPhaseBanner.ok($)
    })
    test('returns 200 application claim', async () => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.claim)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
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

      expect($('#application').text()).toContain('Claimed')
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
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-caption-l').text()).toContain(`Agreement number: ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain('Paid')
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

      expect($('#application').text()).toContain('Paid')
      expect($('#claim').text()).toContain('Paid')

      expectWithdrawLink($, reference, false)

      expectPhaseBanner.ok($)
    })
    test.each([
      ['administrator'],
      ['processor'],
      ['user']
    ])('returns 200 application in check - %s role', async (authScope) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope] } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.incheck)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
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
      expect($('#application').text()).toContain('In check')
      expect($('#claim').text()).toContain('In check')

      expectPhaseBanner.ok($)
    })
    test.each([
      ['administrator'],
      ['processor'],
      ['user']
    ])('returns 200 application ready to pay - %s role', async (authScope) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope] } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.readytopay)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-caption-l').text()).toContain(`Agreement number: ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain('Ready to pay')
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
      expect($('#application').text()).toContain('Ready to pay')
      expect($('#claim').text()).toContain('Ready to pay')

      expectPhaseBanner.ok($)
    })
    test('withdraw link hidden and withdraw confirmation displayed when withdraw link selected by user', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: ['administrator'] } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.agreed)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      const url = `/view-application/${reference}?page=1&withdraw=${true}`
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)

      const $ = cheerio.load(res.payload)
      expectWithdrawLink($, reference, false)
      expectWithdrawConfirmationPanel($, true)
    })

    test('returns 200 application - valid history tab', async () => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.notagreed)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('#history').text()).toContain('History')
      expect($('thead:nth-child(1) tr:nth-child(1) th:nth-child(1)').text()).toContain('Date')
      expect($('thead:nth-child(1) tr:nth-child(1) th:nth-child(2)').text()).toContain('Time')
      expect($('thead:nth-child(1) tr:nth-child(1) th:nth-child(3)').text()).toContain('Action')
      expect($('thead:nth-child(1) tr:nth-child(1) th:nth-child(4)').text()).toContain('User')
      expect($('tbody:nth-child(2) tr:nth-child(1) td:nth-child(1)').text()).toContain('23/03/2023')
      expect($('tbody:nth-child(2) tr:nth-child(1) td:nth-child(2)').text()).toContain('10:00:12')
      expect($('tbody:nth-child(2) tr:nth-child(1) td:nth-child(3)').text()).toContain('Claim approved')
      expect($('tbody:nth-child(2) tr:nth-child(1) td:nth-child(4)').text()).toContain('Daniel Jones')
      expect($('tbody:nth-child(2) tr:nth-child(2)').text()).toContain('24/03/2023')
      expect($('tbody:nth-child(2) tr:nth-child(2)').text()).toContain('09:30:00')
      expect($('tbody:nth-child(2) tr:nth-child(2)').text()).toContain('Withdraw completed')
      expect($('tbody:nth-child(2) tr:nth-child(2)').text()).toContain('Daniel Jones')
      expect($('tbody:nth-child(2) tr:nth-child(3)').text()).toContain('25/03/2023')
      expect($('tbody:nth-child(2) tr:nth-child(3)').text()).toContain('11:10:15')
      expect($('tbody:nth-child(2) tr:nth-child(3)').text()).toContain('Claim rejected')
      expect($('tbody:nth-child(2) tr:nth-child(3)').text()).toContain('Amanda Hassan')

      expectPhaseBanner.ok($)
    })

    test.each([
      { actualState: viewApplicationData.agreed, expectedState: 'Agreed' },
      { actualState: viewApplicationData.notagreed, expectedState: 'Not agreed' },
      { actualState: viewApplicationData.claim, expectedState: 'Claimed' },
      { actualState: viewApplicationData.dataInputted, expectedState: 'Data inputted' },
      { actualState: viewApplicationData.paid, expectedState: 'Paid' },
      { actualState: viewApplicationData.incheck, expectedState: 'In check' },
      { actualState: viewApplicationData.readytopay, expectedState: 'Ready to pay' },
      { actualState: viewApplicationData.withdrawn, expectedState: 'Withdrawn' },
      { actualState: viewApplicationData.accepted, expectedState: 'Accepted' },
      { actualState: viewApplicationData.rejected, expectedState: 'Rejected' }
    ])('correct application and claim status displayed for $expectedState', async ({ actualState, expectedState }) => {
      applications.getApplication.mockReturnValueOnce(actualState)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)
      expect($('#application').text()).toContain(expectedState)
      expect($('#claim').text()).toContain(expectedState)
    })
  })
})
