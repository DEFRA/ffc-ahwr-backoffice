const pagination = require('../../app/pagination')

describe('Pagination', () => {
  test('getPagination test', () => {
    const result = pagination.getPagination(100, 10)
    expect(result.limit).toBe(10)
    expect(result.offset).toBe(990)
  })
  test('getPagination test for first page', () => {
    const result = pagination.getPagination(1, 20)
    expect(result.pages).toBe(undefined)
    expect(result.previous).toBe(undefined)
    expect(result.next).toBe(undefined)
  })
  test('getPagination test for first page without parameter', () => {
    const result = pagination.getPagination()
    expect(result.pages).toBe(undefined)
    expect(result.previous).toBe(undefined)
    expect(result.next).toBe(undefined)
  })
  test('getPagingData test', () => {
    const url = 'test.com'
    const totalPages = 100
    const result = pagination.getPagingData(totalPages, 20, 1, url)
    expect(result.pages).not.toBeNull()
    expect(result.previous).toBeNull()
    expect(result.next).toStrictEqual({ href: `${url}?page=${totalPages / 20}` })
  })
})
