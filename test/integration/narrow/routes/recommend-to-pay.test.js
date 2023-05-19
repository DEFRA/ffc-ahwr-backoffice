const { administrator, recommender } = require('../../../../app/auth/permissions')
const getCrumbs = require('../../../utils/get-crumbs')

const applications = require('../../../../app/api/applications')
jest.mock('../../../../app/api/applications')

jest.mock('../../../../app/routes/utils/process-stage-actions')
const processStageActions = require('../../../../app/routes/utils/process-stage-actions')

jest.mock('../../../../app/routes/utils/crumb-cache')
const crumbCache = require('../../../../app/routes/utils/crumb-cache')

jest.mock('@hapi/boom')
const Boom = require('@hapi/boom')

const reference = 'AHWR-555A-FD4C'
const url = '/recommend-to-pay'

applications.processApplicationClaim = jest.fn().mockResolvedValue(true)

describe('Recommend To Pay test', () => {
  let crumb
  let logSpy

  jest.mock('../../../../app/auth')
  let auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }

  beforeEach(async () => {
    crumb = await getCrumbs(global.__SERVER__)
    jest.clearAllMocks()

    logSpy = jest.spyOn(console, 'log')
  })

  describe(`POST ${url} route`, () => {
    test('returns 302 no auth', async () => {
      const options = {
        method: 'POST',
        url
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
    })

    test('returns 302 when validation fails', async () => {
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          page: 1,
          confirm: 'checkedAgainstChecklist',
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
      expect(logSpy).toHaveBeenCalledWith(`routes:recommend-to-pay: Error when validating payload: ${JSON.stringify({
        errorMessage: '"confirm" must be an array',
        payload: {
          reference: 'AHWR-555A-FD4C',
          page: 1,
          confirm: 'checkedAgainstChecklist'
        }
      })}`)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1&recommendToPay=true&errors=${encodeURIComponent(JSON.stringify([{
        text: 'You must select both checkboxes',
        href: '#pnl-recommend-confirmation'
      }]))}`)
    })

    test('returns 302 when validation fails - no page given', async () => {
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          confirm: 'checkedAgainstChecklist',
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
      expect(logSpy).toHaveBeenCalledWith(`routes:recommend-to-pay: Error when validating payload: ${JSON.stringify({
        errorMessage: '"confirm" must be an array',
        payload: {
          reference: 'AHWR-555A-FD4C',
          confirm: 'checkedAgainstChecklist'
        }
      })}`)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1&recommendToPay=true&errors=%5B%7B%22text%22%3A%22You%20must%20select%20both%20checkboxes%22%2C%22href%22%3A%22%23pnl-recommend-confirmation%22%7D%5D`)
    })

    test.each([
      [recommender, 'recommender'],
      [administrator, 'administrator']
    ])('Redirects correctly on successful validation', async (scope, role) => {
      auth = { strategy: 'session-auth', credentials: { scope: [scope], account: { homeAccountId: 'testId', name: 'admin' } } }
      const response = [
        { action: 'addStageExecution', data: { applicationReference: reference } },
        { action: 'updateStageExecution', data: [1, { applicationReference: reference }] }
      ]
      processStageActions.mockResolvedValueOnce(response)
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          page: 1,
          confirm: ['checkedAgainstChecklist', 'sentChecklist'],
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
      expect(processStageActions).toHaveBeenCalledWith(expect.anything(), role, 'Claim Approve/Reject', 'Recommend to pay', false)
      expect(crumbCache.generateNewCrumb).toHaveBeenCalledTimes(1)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
    })

    test.each([
      [recommender, 'recommender'],
      [administrator, 'administrator']
    ])('Redirects correctly on successful validation - no page given', async (scope, role) => {
      auth = { strategy: 'session-auth', credentials: { scope: [scope], account: { homeAccountId: 'testId', name: 'admin' } } }
      const response = [
        { action: 'addStageExecution', data: { applicationReference: reference } },
        { action: 'updateStageExecution', data: [1, { applicationReference: reference }] }
      ]
      processStageActions.mockResolvedValueOnce(response)
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          confirm: ['checkedAgainstChecklist', 'sentChecklist'],
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
      expect(processStageActions).toHaveBeenCalledWith(expect.anything(), role, 'Claim Approve/Reject', 'Recommend to pay', false)
      expect(crumbCache.generateNewCrumb).toHaveBeenCalledTimes(1)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
    })

    test('Returns 500 on empty results', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
      processStageActions.mockResolvedValueOnce([])
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          page: 1,
          confirm: ['checkedAgainstChecklist', 'sentChecklist'],
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(500)
      expect(Boom.internal).toHaveBeenCalledWith('routes:recommend-to-pay: Error when processing stage actions')
    })

    test('Returns 500 on wrong payload', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
      processStageActions.mockResolvedValueOnce([])
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          page: 1,
          confirm: ['sentChecklist'],
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(500)
      expect(Boom.internal).toHaveBeenCalledWith('routes:recommend-to-pay: Error when validating payload', ['sentChecklist'])
    })
  })
})
