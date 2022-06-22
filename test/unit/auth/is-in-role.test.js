const isInRole = require('../../../app/auth/is-in-role')

describe('test is in role', () => {
  test('return false', () => {
    const res = isInRole({ scope: null }, null)
    expect(res).toBe(false)
  })
  test('return true', () => {
    const res = isInRole({ scope: ['payments'] }, 'payments')
    expect(res).toBe(true)
  })
})
