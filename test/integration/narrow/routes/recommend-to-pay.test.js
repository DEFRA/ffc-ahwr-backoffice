const { administrator } = require('../../../../app/auth/permissions')
const getCrumbs = require('../../../utils/get-crumbs')

const applications = require('../../../../app/api/applications')
jest.mock('../../../../app/api/applications')

jest.mock('../../../../app/auth/get-user')
const getUser = require('../../../../app/auth/get-user')
getUser.mockResolvedValue({ username: 'test' })

jest.mock('../../../../app/api/stage-execution')
const { addStageExecution } = require('../../../../app/api/stage-execution')

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
      expect(logSpy).toHaveBeenCalledWith('Backoffice: recommend-to-pay: Error when validating payload: ', expect.any(Error))
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1&recommendToPay=true&error=true`)
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
      expect(logSpy).toHaveBeenCalledWith('Backoffice: recommend-to-pay: Error when validating payload: ', expect.any(Error))
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1&recommendToPay=true&error=true`)
    })

    test('Redirects correctly on successful validation', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
      addStageExecution.mockResolvedValueOnce(
        {
          applicationReference: reference
        }
      )
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
      expect(logSpy).toHaveBeenCalledWith('Backoffice: recommend-to-pay: Stage execution entry added: ', { applicationReference: reference })
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
    })

    test('Redirects correctly on successful validation - no page given', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
      addStageExecution.mockResolvedValueOnce(
        {
          applicationReference: reference
        }
      )
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
      expect(logSpy).toHaveBeenCalledWith('Backoffice: recommend-to-pay: Stage execution entry added: ', { applicationReference: reference })
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
    })

    test('Returns 500 on api throwing error', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
      addStageExecution.mockResolvedValueOnce([])
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
      expect(logSpy).toHaveBeenCalledWith('Backoffice: recommend-to-pay: Error when adding stage execution entry')
      expect(Boom.internal).toHaveBeenCalledWith('Error when adding stage execution entry')
    })
  })
})
