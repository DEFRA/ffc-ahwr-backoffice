const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')
const { administrator, authoriser } = require('../../../../app/auth/permissions')
const getCrumbs = require('../../../utils/get-crumbs')

const reference = 'AHWR-555A-FD4C'

describe('/approve-application-claim', () => {
  describe('RBAC enabled', () => {
    let processStageActions
    let crumb
    const url = '/approve-application-claim/'
    jest.mock('../../../../app/auth')
    let auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }

    beforeAll(() => {
      jest.mock('../../../../app/config', () => ({
        ...jest.requireActual('../../../../app/config'),
        rbac: {
          enabled: true
        }
      }))

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
            reference
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
            confirm: ['approveClaim', 'sentChecklist'],
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

      test('Approve application invalid reference', async () => {
        auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
        const options = {
          method: 'POST',
          url,
          auth,
          headers: { cookie: `crumb=${crumb}` },
          payload: {
            reference: 123,
            confirm: ['approveClaim', 'sentChecklist'],
            crumb
          }
        }

        const res = await global.__SERVER__.inject(options)

        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toEqual('/view-application/123?page=1&approve=true&errors=%5B%5D')
      })

      test.each([
        [authoriser, 'authoriser'],
        [administrator, 'authoriser']
      ])('Approve application claim processed', async (scope, role) => {
        auth = { strategy: 'session-auth', credentials: { scope: [scope], account: { homeAccountId: 'testId', name: 'admin' } } }
        const options = {
          method: 'POST',
          url,
          auth,
          headers: { cookie: `crumb=${crumb}` },
          payload: {
            reference,
            confirm: ['approveClaim', 'sentChecklist'],
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
          'Paid',
          true
        )
        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
      })

      test('Approve application claim not processed', async () => {
        const options = {
          method: 'POST',
          url,
          auth,
          headers: { cookie: `crumb=${crumb}` },
          payload: {
            reference,
            confirm: ['sentChecklist'],
            page: 1,
            crumb
          }
        }
        const res = await global.__SERVER__.inject(options)
        expect(processStageActions).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toEqual(`/view-application/${reference}?page=1&approve=true&errors=${encodeURIComponent(JSON.stringify([{
          text: 'You must select both checkboxes',
          href: '#authorise-payment-panel'
        }]))}`)
      })

      test('retuns 400 Bad Request', async () => {
        const options = {
          method: 'POST',
          url,
          auth,
          headers: { cookie: `crumb=${crumb}` },
          payload: {
            reference,
            page: 1,
            crumb
          }
        }
        const res = await global.__SERVER__.inject(options)
        expect(processStageActions).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toEqual(`/view-application/${reference}?page=1&approve=true&errors=${encodeURIComponent(JSON.stringify([{
          text: 'You must select both checkboxes',
          href: '#authorise-payment-panel'
        }]))}`)
      })
    })
  })

  describe('RBAC disabled', () => {
    let applications
    let crumb
    const url = '/approve-application-claim/'
    jest.mock('../../../../app/auth')
    let auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }

    beforeAll(() => {
      jest.mock('../../../../app/config', () => ({
        ...jest.requireActual('../../../../app/config'),
        rbac: {
          enabled: false
        }
      }))

      jest.mock('../../../../app/api/applications')
      applications = require('../../../../app/api/applications')

      applications.processApplicationClaim = jest.fn().mockResolvedValue(true)
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
            reference
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
            approveClaim: 'yes',
            page: 1,
            crumb
          },
          headers: { cookie: `crumb=${crumb}` }
        }

        const res1 = await global.__SERVER__.inject(options)
        expect(res1.statusCode).toBe(302)
        const res2 = await global.__SERVER__.inject(options)
        expect(res2.statusCode).toBe(403)
        const $ = cheerio.load(res2.payload)
        expectPhaseBanner.ok($)
        expect($('.govuk-heading-l').text()).toEqual('403 - Forbidden')
      })

      test('Approve application claim processed', async () => {
        auth = { strategy: 'session-auth', credentials: { scope: [administrator], account: { homeAccountId: 'testId', name: 'admin' } } }
        const options = {
          method: 'POST',
          url,
          auth,
          headers: { cookie: `crumb=${crumb}` },
          payload: {
            reference,
            approveClaim: 'yes',
            page: 1,
            crumb
          }
        }
        const res = await global.__SERVER__.inject(options)
        expect(applications.processApplicationClaim).toHaveBeenCalledWith(reference, 'admin', true)
        expect(applications.processApplicationClaim).toHaveBeenCalledTimes(1)
        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
      })

      test('Approve application claim not processed', async () => {
        const options = {
          method: 'POST',
          url,
          auth,
          headers: { cookie: `crumb=${crumb}` },
          payload: {
            reference,
            approveClaim: 'no',
            page: 1,
            crumb
          }
        }
        const res = await global.__SERVER__.inject(options)
        expect(applications.processApplicationClaim).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
      })

      test('retuns 400 Bad Request', async () => {
        const options = {
          method: 'POST',
          url,
          auth,
          headers: { cookie: `crumb=${crumb}` },
          payload: {
            reference,
            page: 1,
            crumb
          }
        }
        const res = await global.__SERVER__.inject(options)
        expect(applications.processApplicationClaim).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(302)
        expect(res.headers.location).toEqual(`/view-application/${reference}?page=1`)
      })
    })
  })
})
