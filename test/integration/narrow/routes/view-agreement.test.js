const cheerio = require('cheerio')
const { Buffer } = require('buffer')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const applications = require('../../../../app/api/applications')
const { administrator } = require('../../../../app/auth/permissions')
const viewApplicationData = require('../../../data/view-applications.json')
const applicationHistoryData = require('../../../data/application-history.json')
const { when, resetAllWhenMocks } = require('jest-when')
const reference = 'AHWR-555A-FD4C'
let getClaimViewStates

function expectWithdrawLink ($, reference, isWithdrawLinkVisible) {
  if (isWithdrawLinkVisible) {
    expect($('.govuk-link').hasClass)
    const withdrawLink = $('.govuk-button')
    expect(withdrawLink.text()).toMatch('Withdraw')
    expect(withdrawLink.attr('href')).toMatch(`/view-agreement/${reference}?page=1&withdraw=true`)
  } else {
    expect($('.govuk-link').not.hasClass)
  }
}
function expectApplicationDetails ($) {
  expect($('#organisation-details .govuk-summary-list__row').length).toEqual(5)

  expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Business name')
  expect($('.govuk-summary-list__value').eq(0).text()).toMatch('My Farm')

  expect($('.govuk-summary-list__key').eq(1).text()).toMatch('SBI number')
  expect($('.govuk-summary-list__value').eq(1).text()).toMatch('333333333')

  expect($('.govuk-summary-list__key').eq(2).text()).toMatch('Address')
  expect($('.govuk-summary-list__value').eq(2).text()).toMatch('Long dusty road, Middle-of-knowhere, In the countryside, CC33 3CC')

  expect($('.govuk-summary-list__key').eq(3).text()).toMatch('Email address')
  expect($('.govuk-summary-list__value').eq(3).text()).toMatch('test@test.com')

  expect($('.govuk-summary-list__key').eq(4).text()).toMatch('Organisation email address')
  expect($('.govuk-summary-list__value').eq(4).text()).toMatch('test@test.com')
}
function expectRecommendButtons ($, areRecommendButtonsVisible) {
  if (areRecommendButtonsVisible) {
    const recommendToPayButton = $('#btn-recommend-to-pay')
    const recommendToRejectButton = $('#btn-recommend-to-reject')

    expect(recommendToPayButton.hasClass('govuk-button'))
    expect(recommendToPayButton.text()).toMatch('Recommend to pay')
    expect(recommendToPayButton.attr('href')).toMatch('/view-agreement/AHWR-555A-FD4C?page=1&recommendToPay=true')

    expect(recommendToRejectButton.hasClass('govuk-button'))
    expect(recommendToRejectButton.text()).toMatch('Recommend to reject')
    expect(recommendToRejectButton.attr('href')).toMatch('')
  } else {
    expect($('#btn-recommend-to-pay').length).toEqual(0)
    expect($('#btn-recommend-to-reject').length).toEqual(0)
  }
}

function expectWithdrawConfirmationPanel ($, istWithdrawConfirmationPanelVisible) {
  const panelText = $('h1:contains("Withdraw agreement")').text()
  const confirmButtonText = $('button:contains("Confirm and continue")').text()

  istWithdrawConfirmationPanelVisible ? expect(panelText).toBeDefined() : expect(panelText).not().toBeDefined()
  istWithdrawConfirmationPanelVisible ? expect(confirmButtonText).toBeDefined() : expect(confirmButtonText).not().toBeDefined()
}

jest.mock('../../../../app/api/applications')
jest.mock('@hapi/wreck', () => ({
  get: jest.fn().mockResolvedValue({ payload: [] })
}))

describe('View Application test', () => {
  const url = `/view-agreement/${reference}`
  jest.mock('../../../../app/auth')
  let auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { username: 'test' } } }

  beforeAll(() => {
    jest.clearAllMocks()

    jest.mock('../../../../app/config', () => ({
      ...jest.requireActual('../../../../app/config'),
      dateOfTesting: {
        enabled: false
      },
      endemics: {
        enabled: true
      }
    }))
    jest.mock('../../../../app/routes/utils/get-claim-view-states')
    getClaimViewStates = require('../../../../app/routes/utils/get-claim-view-states')

    getClaimViewStates.getClaimViewStates.mockReturnValue({
      recommendAction: false,
      recommendToPayForm: false,
      recommendToRejectForm: false,
      authoriseForm: false,
      rejectForm: false,
      withdrawAction: true
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

    test.each([
      ['administrator', true],
      ['authoriser', true],
      ['processor', false],
      ['user', false]
    ])('Withdrawl link feature flag enabled, link displayed as expected for role %s', async (authScope, isWithdrawLinkVisible) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope], account: { username: 'test' } } }
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
      true,
      false
    ])('Recommend buttons displayed as expected for when claim helper returns %s', async (areRecommendButtonsVisible) => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.incheck)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      getClaimViewStates.getClaimViewStates.mockReturnValueOnce({
        recommendAction: areRecommendButtonsVisible
      })
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)
      expectRecommendButtons($, areRecommendButtonsVisible)
    })

    test.each([
      true,
      false
    ])('Present authorisation for payment panel', async (authoriseForm) => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.readytopay)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      when(getClaimViewStates.getClaimViewStates).mockReturnValue({
        authoriseForm
      })
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      if (authoriseForm) {
        expect($('#authorise').length).toEqual(1)
      } else {
        expect($('#authorise').length).toEqual(0)
      }
    })

    test.each([
      true,
      false
    ])('Present authorisation for reject panel', async (rejectForm) => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.readytopay)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      when(getClaimViewStates.getClaimViewStates).mockReturnValue({
        rejectForm
      })
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      if (rejectForm) {
        expect($('#reject').length).toEqual(1)
      } else {
        expect($('#reject').length).toEqual(0)
      }
    })

    test.each([
      false,
      true
    ])('Authorisation form displayed as expected for role %s', async (authoriseForm) => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.readytopay)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      when(getClaimViewStates.getClaimViewStates).mockReturnValue({
        authoriseForm
      })
      const ERROR_MESSAGE_TEXT = 'error_message_text'
      const options = {
        method: 'GET',
        url: `${url}?errors=${Buffer.from(JSON.stringify([{
          text: ERROR_MESSAGE_TEXT,
          href: '#authorise',
          key: 'confirm'
        }])).toString('base64')}`,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      if (authoriseForm) {
        const form = $('#authorise')
        expect(form.length).toEqual(1)
        expect(form.find('.govuk-button').text().trim()).toEqual('Confirm and continue')
        expect(form.find('input[name=reference]').attr('value')).toEqual(reference)
        expect(form.find('#confirm-error').text().trim()).toEqual(`Error: ${ERROR_MESSAGE_TEXT}`)
        expect($('.govuk-error-summary .govuk-list').text().trim()).toEqual(ERROR_MESSAGE_TEXT)
      } else {
        expect($('#authorise').length).toEqual(0)
      }
    })

    test.each([
      false,
      true
    ])('Recommended to pay form displayed as expected when claim helper returns %s', async (recommendToPayForm) => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.readytopay)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      getClaimViewStates.getClaimViewStates.mockReturnValueOnce({
        recommendToPayForm
      })
      const ERROR_MESSAGE_TEXT = 'error_message_text'
      const options = {
        method: 'GET',
        url: `${url}?errors=${Buffer.from(JSON.stringify([{
          text: ERROR_MESSAGE_TEXT,
          href: '#recommend-to-pay',
          key: 'confirm'
        }])).toString('base64')}`,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      if (recommendToPayForm) {
        const form = $('#recommend-to-pay')
        expect(form.length).toEqual(1)
        expect(form.find('.govuk-button').text().trim()).toEqual('Confirm and continue')
        expect(form.find('.govuk-label').first().text().trim()).toEqual('I have checked the claim against the verification checklist and it has passed. I recommend the payment is authorised.')
        expect(form.find('input[name=reference]').attr('value')).toEqual(reference)
        expect(form.find('#confirm-error').text().trim()).toEqual(`Error: ${ERROR_MESSAGE_TEXT}`)
        expect($('.govuk-error-summary .govuk-list').text().trim()).toEqual(ERROR_MESSAGE_TEXT)
      } else {
        expect($('#recommend-to-pay').length).toEqual(0)
      }
    })

    test.each([
      false,
      true
    ])('Authorisation confirm form displayed as expected for role %s', async (rejectForm) => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.readytopay)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      getClaimViewStates.getClaimViewStates.mockReturnValueOnce({
        rejectForm
      })
      const ERROR_MESSAGE_TEXT = 'error_message_text'
      const options = {
        method: 'GET',
        url: `${url}?errors=${Buffer.from(JSON.stringify([{
          text: ERROR_MESSAGE_TEXT,
          href: '#reject',
          key: 'confirm'
        }])).toString('base64')}`,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      if (rejectForm) {
        const rejectClaimPanel = $('#reject')
        expect(rejectClaimPanel.length).toEqual(1)
        expect(rejectClaimPanel.find('.govuk-button').text().trim()).toEqual('Confirm and continue')
        expect(rejectClaimPanel.find('input[name=reference]').attr('value')).toEqual(reference)
        expect(rejectClaimPanel.find('#confirm-error').text().trim()).toEqual(`Error: ${ERROR_MESSAGE_TEXT}`)
        expect($('.govuk-error-summary .govuk-list').text().trim()).toEqual(ERROR_MESSAGE_TEXT)
      } else {
        expect($('#reject-claim-panel').length).toEqual(0)
      }
    })

    test.each([
      false,
      true
    ])('Recommended to reject confirm form displayed as expected when claim helper returns %s', async (recommendToRejectForm) => {
      applications.getApplication.mockReturnValueOnce(viewApplicationData.readytopay)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      getClaimViewStates.getClaimViewStates.mockReturnValueOnce({
        recommendToRejectForm
      })
      const ERROR_MESSAGE_TEXT = 'error_message_text'
      const options = {
        method: 'GET',
        url: `${url}?errors=${encodeURIComponent(Buffer.from(JSON.stringify([{
          text: ERROR_MESSAGE_TEXT,
          href: '#recommend-to-reject',
          key: 'confirm'
        }])).toString('base64'))}`,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      if (recommendToRejectForm) {
        const recommendToRejectForm = $('#recommend-to-reject')
        expect(recommendToRejectForm.length).toEqual(1)
        expect(recommendToRejectForm.find('.govuk-button').text().trim()).toEqual('Confirm and continue')
        expect(recommendToRejectForm.find('.govuk-label').first().text().trim()).toEqual('I have checked the claim against the verification checklist and it has not passed. I recommend the claim is rejected.')
        expect(recommendToRejectForm.find('input[name=reference]').attr('value')).toEqual(reference)
        expect(recommendToRejectForm.find('#confirm-error').text().trim()).toEqual(`Error: ${ERROR_MESSAGE_TEXT}`)
        expect($('.govuk-error-summary .govuk-list').text().trim()).toEqual(ERROR_MESSAGE_TEXT)
      } else {
        expect($('#recommend-to-reject').length).toEqual(0)
      }
    })

    test.each([
      ['administrator', true],
      ['authoriser', true],
      ['recommender', false],
      ['processor', false],
      ['user', false]
    ])('Withdraw link feature flag disabled, link not displayed for role %s', async (authScope, withdrawAction) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope], account: { username: 'test' } } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.agreed)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      getClaimViewStates.getClaimViewStates.mockReturnValueOnce({
        withdrawAction
      })

      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      expectWithdrawLink($, reference, withdrawAction)
    })

    test.each([
      ['administrator', true],
      ['processor', false],
      ['user', false]
    ])('returns 200 application agreed - %s role', async (authScope, isWithdrawLinkVisible) => {
      const status = 'Agreed'
      auth = { strategy: 'session-auth', credentials: { scope: [authScope], account: { username: 'test' } } }
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
      expect($('h2.govuk-heading-l').text()).toContain(status)
      expect($('title').text()).toContain('Administration: User Agreement')

      expectApplicationDetails($)

      expect($('#application .govuk-summary-list__row:nth-child(1) dt').text()).toContain('Status')
      expect($('#application .govuk-summary-list__row:nth-child(1) dd').text()).toContain(status)
      expect($('#application .govuk-summary-list__row:nth-child(2) dt').text()).toContain('Date of agreement')
      expect($('#application .govuk-summary-list__row:nth-child(2) dd').text()).toContain('06/06/2022')
      expect($('#application .govuk-summary-list__row:nth-child(3) dt').text()).toContain('Business details correct')
      expect($('#application .govuk-summary-list__row:nth-child(3) dd').text()).toContain('Yes')
      expect($('#application .govuk-summary-list__row:nth-child(4) dt').text()).toContain('Type of review')
      expect($('#application .govuk-summary-list__row:nth-child(4) dd').text()).toContain('Sheep')
      expect($('#application .govuk-summary-list__row:nth-child(5) dt').text()).toContain('Number of livestock')
      expect($('#application .govuk-summary-list__row:nth-child(5) dd').text()).toContain('Minimum 21')
      expect($('#application .govuk-summary-list__row:nth-child(6) dt').text()).toContain('Agreement accepted')
      expect($('#application .govuk-summary-list__row:nth-child(6) dd').text()).toContain('Yes')

      expectWithdrawLink($, reference, isWithdrawLinkVisible)

      expectPhaseBanner.ok($)
    })

    test.each([
      ['administrator'],
      ['processor'],
      ['user']
    ])('returns 200 application in check - %s role', async (authScope) => {
      const status = 'In check'
      auth = { strategy: 'session-auth', credentials: { scope: [authScope], account: { username: 'test' } } }
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
      expect($('h2.govuk-heading-l').text()).toContain(status)
      expect($('title').text()).toContain('Administration: User Agreement')

      expectApplicationDetails($)

      expect($('#application .govuk-summary-list__key').eq(1).text()).toContain('Date of agreement')
      expect($('#application .govuk-summary-list__value').eq(1).text()).toContain('06/06/2022')
      expect($('#application .govuk-summary-list__key').eq(2).text()).toContain('Business details correct')
      expect($('#application .govuk-summary-list__value').eq(2).text()).toContain('Yes')
      expect($('#application .govuk-summary-list__key').eq(3).text()).toContain('Type of review')
      expect($('#application .govuk-summary-list__value').eq(3).text()).toContain('Sheep')
      expect($('#application .govuk-summary-list__key').eq(4).text()).toContain('Number of livestock')
      expect($('#application .govuk-summary-list__value').eq(4).text()).toContain('Minimum 21')
      expect($('#application .govuk-summary-list__key').eq(5).text()).toContain('Agreement accepted')
      expect($('#application .govuk-summary-list__value').eq(5).text()).toContain('Yes')
      expect($('#application').text()).toContain(status)
      expect($('#claim').text()).toContain(status)

      expectPhaseBanner.ok($)
    })
    test.each([
      ['administrator'],
      ['processor'],
      ['user']
    ])('returns 200 application ready to pay - %s role', async (authScope) => {
      const status = 'Ready to pay'
      auth = { strategy: 'session-auth', credentials: { scope: [authScope], account: { username: 'test' } } }
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
      expect($('h2.govuk-heading-l').text()).toContain(status)
      expect($('title').text()).toContain('Administration: User Agreement')

      expectApplicationDetails($)

      expect($('#application').text()).toContain(status)
      expect($('#claim').text()).toContain(status)

      expectPhaseBanner.ok($)
    })
    test('withdraw link hidden and withdraw confirmation displayed when withdraw link selected by user', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: ['administrator'], account: { username: 'test' } } }
      applications.getApplication.mockReturnValueOnce(viewApplicationData.agreed)
      applications.getApplicationHistory.mockReturnValueOnce(applicationHistoryData)
      const url = `/view-agreement/${reference}?page=1&withdraw=${true}`
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
      expect($('tbody:nth-child(2) tr:nth-child(1) td:nth-child(3)').text()).toContain('Approved')
      expect($('tbody:nth-child(2) tr:nth-child(1) td:nth-child(4)').text()).toContain('Daniel Jones')
      expect($('tbody:nth-child(2) tr:nth-child(2)').text()).toContain('24/03/2023')
      expect($('tbody:nth-child(2) tr:nth-child(2)').text()).toContain('09:30:00')
      expect($('tbody:nth-child(2) tr:nth-child(2)').text()).toContain('Withdrawn')
      expect($('tbody:nth-child(2) tr:nth-child(2)').text()).toContain('Daniel Jones')
      expect($('tbody:nth-child(2) tr:nth-child(3)').text()).toContain('25/03/2023')
      expect($('tbody:nth-child(2) tr:nth-child(3)').text()).toContain('11:10:15')
      expect($('tbody:nth-child(2) tr:nth-child(3)').text()).toContain('Rejected')
      expect($('tbody:nth-child(2) tr:nth-child(3)').text()).toContain('Amanda Hassan')

      expectPhaseBanner.ok($)
    })

    test.each([
      ['Claim confirmation form displayed', 'administrator', false, '', true],
      ['Claim confirmation form not displayed', 'administrator', true, '', false],
      ['Claim confirmation form not displayed - invalid scope', 'user', false, '', false],
      ['Claim confirmation form not displayed - approve query string true', 'administrator', false, '?approve=true', false],
      ['Claim confirmation form not displayed - reject query string true', 'administrator', false, '?reject=true', false]
    ])('%s', async ({ testName, authScope, queryParam, exepectedResult }) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope], account: { username: 'test' } } }
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
        url: `/view-agreement/${reference}/${queryParam}`,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      const panelClass = '.govuk-panel__title-s .govuk-!-font-size-36 .govuk-!-margin-top-1'
      exepectedResult ? expect($(panelClass).hasClass) : expect($(panelClass).not.hasClass)
    })

    test.each([
      ['Approve claim confirmation form displayed', 'administrator', false, '?approve=true', true],
      ['Approve claim confirmation form not displayed', 'administrator', true, '?approve=true', false],
      ['Approve claim confirmation form not displayed - invalid scope', 'user', false, '?approve=true', false],
      ['Approve claim confirmation form not displayed - approve query string false', 'administrator', false, '?approve=false', false],
      ['Approve claim confirmation form not displayed - approve query string missing', 'administrator', false, '', false]
    ])('%s', async ({ testName, authScope, queryParam, exepectedResult }) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope], account: { username: 'test' } } }
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
        url: `/view-agreement/${reference}/${queryParam}`,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      const approveClaimButtonClass = '.govuk-button .govuk-button .govuk-!-margin-bottom-3'
      exepectedResult ? expect($(approveClaimButtonClass).hasClass) : expect($(approveClaimButtonClass).not.hasClass)
    })

    test.each([
      ['Reject claim confirmation form displayed', 'administrator', false, '?reject=true', true],
      ['Reject claim confirmation form not displayed', 'administrator', true, '?reject=true', false],
      ['Reject claim confirmation form not displayed - invalid scope', 'user', false, '?reject=true', false],
      ['Reject claim confirmation form not displayed - reject query string false', 'administrator', false, '?reject=false', false],
      ['Reject claim confirmation form not displayed - reject query string missing', 'administrator', false, '', false]
    ])('%s', async ({ testName, authScope, queryParam, exepectedResult }) => {
      auth = { strategy: 'session-auth', credentials: { scope: [authScope], account: { username: 'test' } } }
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
        url: `/view-agreement/${reference}/${queryParam}`,
        auth
      }

      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)

      const rejectClaimButtonClass = '.govuk-button. govuk-button--secondary .govuk-!-margin-bottom-3'
      exepectedResult ? expect($(rejectClaimButtonClass).hasClass) : expect($(rejectClaimButtonClass).not.hasClass)
    })
  })
})
