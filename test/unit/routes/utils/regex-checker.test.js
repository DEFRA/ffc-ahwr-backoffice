const regexChecker = require('../../../../app/routes/utils/regex-checker')

describe('regexChecker', () => {
  test('should return false if the string is empty', () => {
    const regex = /[0-9]+/
    const str = ''
    const result = regexChecker(regex, str)
    expect(result).toBeFalsy()
  })
  test('should return true if the string matches the regex', () => {
    const regex = /[0-9]+/
    const str = '12345'
    const result = regexChecker(regex, str)
    expect(result).toBeTruthy()
  })

  test('should return false if the string does not match the regex', () => {
    const regex = /[0-9]+/
    const str = 'abc'
    const result = regexChecker(regex, str)
    expect(result).toBeFalsy()
  })

  test('should handle invalid regex', () => {
    const regex = '['
    const str = '12345'
    const result = regexChecker(regex, str)
    expect(result).toBeFalsy()
  })
})
