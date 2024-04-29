const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const applications = require('../../../../app/api/applications')
const { administrator } = require('../../../../app/auth/permissions')
const viewApplicationData = require('.././../../data/view-applications.json')
const applicationHistoryData = require('../../../data/application-history.json')
const applicationEventData = require('../../../data/application-events.json')
const { resetAllWhenMocks } = require('jest-when')
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

jest.mock('../../../../app/api/applications')

describe('View Application test with Date of Testing enabled', () => {
  const url = `/view-application/${reference}`
  jest.mock('../../../../app/auth')
  const auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }

  jest.mock('../../../../app/config', () => ({
    ...jest.requireActual('../../../../app/config'),
    dateOfTesting: {
      enabled: true
    }
  }))

  beforeAll(() => {
    jest.clearAllMocks()
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
    test('returns 200 application claim - claim date in application data', async () => {
      const status = 'Claimed'
      applications.getApplication.mockReturnValueOnce(viewApplicationData.claim)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      claimFormHelper.mockReturnValueOnce({
        subStatus: status
      })

      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-caption-l').text()).toContain(`Agreement number: ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain(status)
      expect($('title').text()).toContain('Administration: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(5)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Name')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('Farmer name')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('SBI number')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Address')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(3).text()).toMatch('Email address')
      expect($('.govuk-summary-list__value').eq(3).text()).toMatch('test@test.com')

      expect($('.govuk-summary-list__key').eq(4).text()).toMatch('Org Email address')
      expect($('.govuk-summary-list__value').eq(4).text()).toMatch('test@test.com')

      expect($('#application').text()).toContain(status)
      expect($('#claim').text()).toContain(status)

      expect($('tbody:nth-child(1) tr:nth-child(1)').text()).toContain('Date of review')
      expect($('tbody:nth-child(1) tr:nth-child(1)').text()).toContain('07/11/2022')
      expect($('tbody:nth-child(1) tr:nth-child(2)').text()).toContain('Date of testing')
      expect($('tbody:nth-child(1) tr:nth-child(2)').text()).toContain('08/11/2022')
      expect($('tbody:nth-child(1) tr:nth-child(3)').text()).toContain('Date of claim')
      expect($('tbody:nth-child(1) tr:nth-child(3)').text()).toContain('09/11/2022')
      expect($('tbody:nth-child(1) tr:nth-child(4)').text()).toContain('Review details confirmed')
      expect($('tbody:nth-child(1) tr:nth-child(4)').text()).toContain('Yes')
      expect($('tbody:nth-child(1) tr:nth-child(5)').text()).toContain('Vet’s name')
      expect($('tbody:nth-child(1) tr:nth-child(5)').text()).toContain('testVet')
      expect($('tbody:nth-child(1) tr:nth-child(6)').text()).toContain('Vet’s RCVS number')
      expect($('tbody:nth-child(1) tr:nth-child(6)').text()).toContain('1234234')
      expect($('tbody:nth-child(1) tr:nth-child(7)').text()).toContain('Test results unique reference number (URN)')
      expect($('tbody:nth-child(1) tr:nth-child(7)').text()).toContain('134242')

      expectWithdrawLink($, reference, false)

      expectPhaseBanner.ok($)
    })

    test('returns 200 application claim - no claim date in application data', async () => {
      const status = 'Claimed'
      applications.getApplication.mockReturnValueOnce(viewApplicationData.claimWithNoClaimDate)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      applications.getApplicationEvents.mockReturnValueOnce(applicationEventData)
      claimFormHelper.mockReturnValueOnce({
        subStatus: status
      })
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-caption-l').text()).toContain(`Agreement number: ${reference}`)
      expect($('h2.govuk-heading-l').text()).toContain(status)
      expect($('title').text()).toContain('Administration: User Application')
      expect($('.govuk-summary-list__row').length).toEqual(5)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Name')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('Farmer name')

      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('SBI number:')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch('333333333')

      expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Address:')
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

      expect($('.govuk-summary-list__key').eq(3).text()).toMatch('Email address:')
      expect($('.govuk-summary-list__value').eq(3).text()).toMatch('test@test.com')

      expect($('.govuk-summary-list__key').eq(4).text()).toMatch('Organisation email address')
      expect($('.govuk-summary-list__value').eq(4).text()).toMatch('test@test.com')

      expect($('#application').text()).toContain(status)
      expect($('#claim').text()).toContain(status)

      expect($('tbody:nth-child(1) tr:nth-child(1)').text()).toContain('Date of review')
      expect($('tbody:nth-child(1) tr:nth-child(1)').text()).toContain('07/11/2022')
      expect($('tbody:nth-child(1) tr:nth-child(2)').text()).toContain('Date of testing')
      expect($('tbody:nth-child(1) tr:nth-child(2)').text()).toContain('08/11/2022')
      expect($('tbody:nth-child(1) tr:nth-child(3)').text()).toContain('Date of claim')
      expect($('tbody:nth-child(1) tr:nth-child(3)').text()).toContain('09/11/2022')
      expect($('tbody:nth-child(1) tr:nth-child(4)').text()).toContain('Review details confirmed')
      expect($('tbody:nth-child(1) tr:nth-child(4)').text()).toContain('Yes')
      expect($('tbody:nth-child(1) tr:nth-child(5)').text()).toContain('Vet’s name')
      expect($('tbody:nth-child(1) tr:nth-child(5)').text()).toContain('testVet')
      expect($('tbody:nth-child(1) tr:nth-child(6)').text()).toContain('Vet’s RCVS number')
      expect($('tbody:nth-child(1) tr:nth-child(6)').text()).toContain('1234234')
      expect($('tbody:nth-child(1) tr:nth-child(7)').text()).toContain('Test results unique reference number (URN)')
      expect($('tbody:nth-child(1) tr:nth-child(7)').text()).toContain('134242')

      expectWithdrawLink($, reference, false)

      expectPhaseBanner.ok($)
    })
  })
})
