const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { administrator, authoriser } = require('../../../../app/auth/permissions')
const getCrumbs = require('../../../utils/get-crumbs')

const reference = 'AHWR-555A-FD4C'
const encodedEmptyArray = 'W10%3D'
const encodedErrors = 'W3sidGV4dCI6IlNlbGVjdCBib3RoIGNoZWNrYm94ZXMiLCJocmVmIjoiI3JlamVjdC1jbGFpbS1wYW5lbCJ9XQ%3D%3D'

describe('Reject Application test', () => {
  let processStageActions
  let crumb
  const url = '/reject-application-claim/'
  jest.mock('../../../../app/auth')
  let auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }

  beforeAll(() => {
    jest.mock('../../../../app/routes/utils/process-stage-actions')
    processStageActions = require('../../../../app/routes/utils/process-stage-actions')
  })

  afterAll(() => {
    jest.resetModules()
  })

  beforeEach(async () => {
    crumb = await getCrumbs(global.__SERVER__)
    jest.clearAllMocks()
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

    test('returns 403', async () => {
      const options = {
        method: 'POST',
        url,
        auth,
        payload: {
          reference,
          claimOrApplication: 'application'
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(403)
      const $ = cheerio.load(res.payload)
      expect($('h1.govuk-heading-l').text()).toEqual('403 - Forbidden')
      expectPhaseBanner.ok($)
    })

    test('returns 403 when duplicate submission - $crumb', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        auth,
        method: 'POST',
        url,
        payload: {
          reference,
          claimOrApplication: 'application',
          confirm: ['rejectClaim', 'sentChecklist'],
          page: 1,
          crumb
        },
        headers: { cookie: `crumb=${crumb}` }
      }
      const response = [
        { action: 'addStageExecution', data: { applicationReference: reference } },
        { action: 'updateStageExecution', data: [1, { applicationReference: reference }] }
      ]
      processStageActions.mockResolvedValueOnce(response)

      const res1 = await global.__SERVER__.inject(options)
      expect(res1.statusCode).toBe(302)
      const res2 = await global.__SERVER__.inject(options)
      expect(res2.statusCode).toBe(403)
      const $ = cheerio.load(res2.payload)
      expectPhaseBanner.ok($)
      expect($('.govuk-heading-l').text()).toEqual('403 - Forbidden')
    })

    test.each([
      [authoriser, 'authoriser'],
      [administrator, 'authoriser']
    ])('Reject application claim processed', async (scope, role) => {
      auth = { strategy: 'session-auth', credentials: { scope: [scope], account: { homeAccountId: 'testId', name: 'admin' } } }
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          claimOrApplication: 'application',
          confirm: ['rejectClaim', 'sentChecklist'],
          page: 1,
          crumb
        }
      }
      const response = [
        { action: 'addStageExecution', data: { applicationReference: reference } },
        { action: 'updateStageExecution', data: [1, { applicationReference: reference }] }
      ]
      processStageActions.mockResolvedValueOnce(response)

      const res = await global.__SERVER__.inject(options)

      expect(processStageActions).toHaveBeenCalledWith(
        expect.anything(),
        role,
        'Claim Approve/Reject',
        'Rejected',
        false
      )
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/view-agreement/${reference}?page=1`)
    })
    test('Reject claim processed', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [], account: { homeAccountId: 'testId', name: 'admin' } } }
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          claimOrApplication: 'claim',
          confirm: ['rejectClaim', 'sentChecklist'],
          page: 1,
          crumb
        }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(500)
    })
    test('Reject application invalid reference', async () => {
      auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference: 123,
          claimOrApplication: 'application',
          confirm: ['rejectClaim', 'sentChecklist'],
          crumb
        }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/view-agreement/123?page=1&reject=true&errors=${encodedEmptyArray}`)
    })

    test('Reject application claim not processed', async () => {
      const options = {
        method: 'POST',
        url,
        auth,
        headers: { cookie: `crumb=${crumb}` },
        payload: {
          reference,
          claimOrApplication: 'application',
          confirm: ['sentChecklist'],
          page: 1,
          crumb
        }
      }
      const res = await global.__SERVER__.inject(options)
      expect(processStageActions).not.toHaveBeenCalled()
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/view-agreement/${reference}?page=1&reject=true&errors=${encodedErrors}`)
    })
  })

  test('retuns 400 Bad Request', async () => {
    const options = {
      method: 'POST',
      url,
      auth,
      headers: { cookie: `crumb=${crumb}` },
      payload: {
        reference,
        claimOrApplication: 'application',
        page: 1,
        crumb
      }
    }
    const res = await global.__SERVER__.inject(options)
    expect(processStageActions).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual(`/view-agreement/${reference}?page=1&reject=true&errors=${encodedErrors}`)
  })
  test('retuns 400 Bad Request for claim', async () => {
    const options = {
      method: 'POST',
      url,
      auth,
      headers: { cookie: `crumb=${crumb}` },
      payload: {
        reference,
        claimOrApplication: 'claim',
        page: 1,
        returnPage: 'claims',
        crumb
      }
    }
    const res = await global.__SERVER__.inject(options)
    expect(processStageActions).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual(`/view-claim/${reference}?reject=true&returnPage=claims&errors=${encodedErrors}`)
  })
})
