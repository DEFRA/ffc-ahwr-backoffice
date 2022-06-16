const pagination = require('../../app/pagination')

describe('Pagination', () => {
  test('getPagination test', () => {
    const result = pagination.getPagination(100, 10)
    expect(result.limit).toBe(10)
    expect(result.offset).toBe(990)
  })
  test('getPagination test for first page', () => {
    const result = pagination.getPagination(1, 10)
    expect(result.limit).toBe(10)
    expect(result.offset).toBe(0)
  })
  test('getPagingData test', () => {
    const result = pagination.getPagingData(100, 10, 1, 'test.com')
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
    expect(result.totalPages).toBe(10)
    expect(result.total).toBe(100)
    expect(result.url).toBe('test.com')
  })
})
