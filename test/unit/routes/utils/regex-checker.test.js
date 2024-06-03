
const regexChecker = require('../../../../app/routes/utils/regex-checker')

describe('regexChecker', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterAll(() => {
    console.error.mockRestore()
  })
  afterEach(() => {
    console.error.mockClear()
  })
  test('should return false if the string is empty', () => {
    const regex = /^IAHW-[A-Z0-9]{4}-[A-Z0-9]{4}$/i
    const str = ''
    const result = regexChecker(regex, str)
    expect(result).toBeFalsy()
  })
  test('should return true if the string matches the regex', () => {
    const regex = /^IAHW-[A-Z0-9]{4}-[A-Z0-9]{4}$/i
    const str = 'IAHW-1234-5678'
    const result = regexChecker(regex, str)
    expect(result).toBeTruthy()
  })
  test('should return true if the string matches the regex', () => {
    const regex = /^AHWR-[A-Z0-9]{4}-[A-Z0-9]{4}$/i
    const str = 'AHWR-1234-5678'
    const result = regexChecker(regex, str)
    expect(result).toBeTruthy()
  })

  test('should return false if the string does not match the regex', () => {
    const regex = /^AHWR-[\da-f]{4}-[\da-f]{4}$/i
    const str = 'AHWR-1234-APP1'
    const result = regexChecker(regex, str)
    expect(result).toBeFalsy()
  })

  test('should handle invalid regex', () => {
    const regex = '['
    const str = '12345'
    const result = regexChecker(regex, str)
    expect(result).toBeFalsy()
  })
  test('should show error if regex is invalid', () => {
    console.error = jest.fn()

    const regex = '['
    const str = '12345'
    regexChecker(regex, str)

    expect(regexChecker(regex, str)).toBeFalsy()
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid regex: [ is false'))
  })
})
