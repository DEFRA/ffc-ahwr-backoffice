const appRefRegEx = /^AHWR-[\da-f]{4}-[\da-f]{4}$/i
const validStatus = [
  'agreed',
  'applied',
  'withdrawn',
  'data inputted',
  'inputted',
  'claimed',
  'in check',
  'check',
  'recommended',
  'pay',
  'recommended to pay',
  'reject',
  'recommended to reject',
  'paid',
  'not agreed',
  'agreed',
  'ready to pay',
  'ready',
  'hold',
  'on hold'
]
const sbiRegEx = /^[\0-9]{9}$/i

module.exports = (searchText) => {
  let searchType
  searchText = (searchText ?? '').trim()
  switch (true) {
    case appRefRegEx.test(searchText):
      searchType = 'ref'
      break
    case validStatus.indexOf(searchText.toLowerCase()) !== -1:
      searchType = 'status'
      break
    case sbiRegEx.test(searchText):
      searchType = 'sbi'
      break
    default:
      searchType = 'organisation'
      break
  }

  if (searchText.length <= 0) {
    searchType = 'reset'
  }

  return {
    searchText,
    searchType
  }
}
