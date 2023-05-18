const { administrator } = require('../../../../app/auth/permissions')
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
const url = '/recommend-to-reject'

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

    test('returns 302 when validation fails - no page given', async () => {
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
      expect(logSpy).toHaveBeenCalledWith('Backoffice: recommend-to-reject: Error when validating payload: ', expect.any(Error))
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1&recommendToReject=true&errors=%5B%7B%22text%22%3A%22You%20must%20select%20both%20checkboxes%22%2C%22href%22%3A%22%23pnl-recommend-to-reject%22%7D%5D`)
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
      expect(logSpy).toHaveBeenCalledWith('Backoffice: recommend-to-reject: Error when validating payload: ', expect.any(Error))
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1&recommendToReject=true&errors=%5B%7B%22text%22%3A%22You%20must%20select%20both%20checkboxes%22%2C%22href%22%3A%22%23pnl-recommend-to-reject%22%7D%5D`)
    })

    test('Redirects correctly on successful validation', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
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
      expect(crumbCache.generateNewCrumb).toHaveBeenCalledTimes(1)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
    })

    test('Redirects correctly on successful validation - no page given', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
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
      expect(crumbCache.generateNewCrumb).toHaveBeenCalledTimes(1)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
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
      expect(Boom.internal).toHaveBeenCalledWith('Error when validating payload', options.payload.confirm)
    })
  })
})
