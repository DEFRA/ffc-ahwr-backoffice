const regexChecker = require('../../app/routes/utils/regex-checker')

const appRefRegEx = /^AHWR-[A-Z0-9]{4}-[A-Z0-9]{4}$/i
const newAppRefRegEx = /^IAHW-[A-Z0-9]{4}-[A-Z0-9]{4}$/i
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
  'rejected',
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
    case regexChecker(appRefRegEx, searchText) || regexChecker(newAppRefRegEx, searchText):
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
