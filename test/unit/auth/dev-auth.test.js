const devAuth = require('../../../app/auth/dev-auth')
const { administrator, processor, user, recommender, authoriser } = require('../../../app/auth/permissions')
const MOCK_COOKIE_AUTH_SET = jest.fn()

describe('Dev auth test', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('getAuthenticationUrl test', () => {
    expect(devAuth.getAuthenticationUrl()).toBe('/dev-auth')
  })
  test('authenticate test', async () => {
    await devAuth.authenticate(expect.anything(), { set: MOCK_COOKIE_AUTH_SET })
    expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledTimes(1)
  })
  test('refresh test', async () => {
    expect(await devAuth.refresh(expect.anything(), { set: MOCK_COOKIE_AUTH_SET }, false)).toEqual([administrator, processor, user, recommender, authoriser])
    expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledTimes(1)
  })
  test('logout test', () => {
    expect(devAuth.logout).toBeDefined()
  })
})
