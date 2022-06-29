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
    expect(result.next).toStrictEqual({ href: `${url}?page=2` })
  })

  test('getPagingData test for page 4/5', () => {
    const url = 'test.com'
    const totalPages = 100
    const result = pagination.getPagingData(totalPages, 20, 4, url)
    expect(result.pages).toStrictEqual([{ current: false, href: 'test.com?page=2', number: 2 }, { current: false, href: 'test.com?page=3', number: 3 }, { current: true, href: 'test.com?page=4', number: 4 }, { current: false, href: 'test.com?page=5', number: 5 }])
    expect(result.previous).toStrictEqual({ href: `${url}?page=3` })
    expect(result.next).toStrictEqual({ href: `${url}?page=5` })
  })

  test('getPagingData test for page 5/5', () => {
    const url = 'test.com'
    const totalPages = 100
    const result = pagination.getPagingData(totalPages, 20, 5, url)
    expect(result.pages).toStrictEqual([{ current: false, href: 'test.com?page=3', number: 3 }, { current: false, href: 'test.com?page=4', number: 4 }, { current: true, href: 'test.com?page=5', number: 5 }])
    expect(result.previous).toStrictEqual({ href: `${url}?page=4` })
    expect(result.next).toBeNull()
  })
})
