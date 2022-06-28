const getUser = require('../../../app/auth/get-user')

describe('Get user test', () => {
  test('returns userId and username', () => {
    const request = { auth: { credentials: { account: { homeAccountId: 'testId', name: 'testuser' } } } }
    const res = getUser(request)
    expect(res.userId).toBe('testId')
    expect(res.username).toBe('testuser')
  })
})
