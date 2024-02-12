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
const url = '/recommend-to-reject'
const encodedEmptyArray = 'W10%3D'
const encodedErrors = 'W3sidGV4dCI6IlNlbGVjdCBib3RoIGNoZWNrYm94ZXMiLCJocmVmIjoiI3BubC1yZWNvbW1lbmQtY29uZmlybWF0aW9uIn1d'

applications.processApplicationClaim = jest.fn().mockResolvedValue(true)

describe('Recommended To Reject test', () => {
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
      expect(logSpy).toHaveBeenCalledWith(`routes:recommend-to-reject: Error when validating payload: ${JSON.stringify({
        errorMessage: '"confirm" must be an array',
        payload: {
          reference: 'AHWR-555A-FD4C',
          page: 1,
          confirm: 'checkedAgainstChecklist'
        }
      })}`)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1&recommendToReject=true&errors=${encodedErrors}`)
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
      expect(logSpy).toHaveBeenCalledWith(`routes:recommend-to-reject: Error when validating payload: ${JSON.stringify({
        errorMessage: '"confirm" must be an array',
        payload: {
          reference: 'AHWR-555A-FD4C',
          confirm: 'checkedAgainstChecklist'
        }
      })}`)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1&recommendToReject=true&errors=${encodedErrors}`)
    })

    test.each([
      [recommender, 'recommender'],
      [administrator, 'recommender']
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
      expect(processStageActions).toHaveBeenCalledWith(expect.anything(), role, 'Claim Approve/Reject', 'Recommend to reject', false)
      expect(crumbCache.generateNewCrumb).toHaveBeenCalledTimes(1)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
    })

    test.each([
      [recommender, 'recommender'],
      [administrator, 'recommender']
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
      expect(processStageActions).toHaveBeenCalledWith(expect.anything(), role, 'Claim Approve/Reject', 'Recommend to reject', false)
      expect(crumbCache.generateNewCrumb).toHaveBeenCalledTimes(1)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
    })

    test('Returns 302 on wrong payload', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
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
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/view-application/${reference}?page=1&recommendToReject=true&errors=${encodedErrors}`)
    })

    test('Recommended to reject invalid reference', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference: 123,
          confirm: ['recommendToReject', 'sentChecklist'],
          crumb
        }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/view-application/123?page=1&recommendToReject=true&errors=${encodedEmptyArray}`)
    })

    test('Returns 500 on error when processing stage actions', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
      processStageActions.mockRejectedValueOnce(new Error('Error when processing stage actions'))
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
      expect(Boom.internal).toHaveBeenCalledWith('Error when processing stage actions')
    })
  })
})
