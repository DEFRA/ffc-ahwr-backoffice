const { administrator } = require('../../../../app/auth/permissions')










jest.mock('../../../../app/api/applications')

describe('multiple claims test', () => {
  const url = `/multiple-claims/${reference}`
  jest.mock('../../../../app/auth')
  let auth = { strategy: 'session-auth', credentials: { scope: [administrator] } }

  beforeAll(() => {
    jest.clearAllMocks()

    jest.mock('../../../../app/config', () => ({
      ...jest.requireActual('../../../../app/config'),
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
})
})