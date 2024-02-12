const setSearchParams = require('../../app/lib/search-validation')

describe('Set sesrch params test', () => {
  test.each([
    { type: 'ref', text: 'AHWR-5446-5EF4' },
    { type: 'sbi', text: '107279003' },
    { type: 'organisation', text: 'a string' },
    { type: 'reset', text: '' }
  ])('A valid $searchType ($text) should return $text and $type as type', ({ type, text }) => {
    const { searchText, searchType } = setSearchParams(text)
    expect(searchType).toBe(type)
    expect(searchText).toBe(text)
  })
  test.each([
    { status: 'agreed' },
    { status: 'applied' },
    { status: 'withdrawn' },
    { status: 'data inputted' },
    { status: 'inputted' },
    { status: 'claimed' },
    { status: 'in check' },
    { status: 'check' },
    { status: 'recommended' },
    { status: 'pay' },
    { status: 'recommended to pay' },
    { status: 'reject' },
    { status: 'recommended to reject' },
    { status: 'paid' },
    { status: 'rejected' },
    { status: 'not agreed' },
    { status: 'ready' },
    { status: 'ready to pay' },
    { status: 'hold' },
    { status: 'on hold' }
  ])('A valid status ($status) should return $status and status as type', ({ status }) => {
    const { searchText, searchType } = setSearchParams(status)
    expect(searchType).toBe('status')
    expect(searchText).toBe(status)
  })
})
