const mapAuth = require('../../../app/auth/map-auth')

describe('Map auth test', () => {
  test('returns auth object', () => {
    const request = { auth: { isAuthenticated: true, credentials: 'Payments.Scheme.Admin' } }
    const res = mapAuth(request)
    expect(res).toMatchObject({ isAuthenticated: true, isAnonymous: false, isSchemeAdminUser: false, isHoldAdminUser: false })
  })
})
