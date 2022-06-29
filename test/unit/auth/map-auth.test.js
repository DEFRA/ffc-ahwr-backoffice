const mapAuth = require('../../../app/auth/map-auth')

describe('Map auth test', () => {
  test('returns auth object', () => {
    const request = { auth: { isAuthenticated: true, credentials: 'administrator' } }
    const res = mapAuth(request)
    expect(res).toMatchObject({ isAuthenticated: true, isAnonymous: false, isAdministrator: false, isProcessor: false, isUser: false })
  })
})
