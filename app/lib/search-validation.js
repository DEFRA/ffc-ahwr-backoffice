const appRefRegEx = /^AHWR-[\da-f]{4}-[\da-f]{4}$/i
const validStatus = ['agreed', 'applied', 'withdrawn', 'data inputted', 'claimed', 'check', 'accepted', 'rejected', 'paid', 'not agreed']
const sbiRegEx = /^[\0-9]{9}$/i
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

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
    case emailRegex.test(searchText.toLowerCase()):
      searchType = 'email'
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
