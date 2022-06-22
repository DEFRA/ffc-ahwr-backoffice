const devAuth = require('../../../app/auth/dev-auth')

describe('Deve auth test', () => {
  test('getAuthenticationUrl test', () => {
    expect(devAuth.getAuthenticationUrl()).toBe('/dev-auth')
  })
  test('authenticate test', () => {
    expect(devAuth.authenticate).toBeDefined()
  })
  test('refresh test', () => {
    expect(devAuth.refresh).toBeDefined()
  })
  test('logout test', () => {
    expect(devAuth.logout).toBeDefined()
  })
})
