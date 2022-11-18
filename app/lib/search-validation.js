const appRefRegEx = /^AHWR-[\da-f]{4}-[\da-f]{4}$/i
const validStatus = ['agreed', 'applied', 'withdrawn', 'data inputted', 'claimed', 'check', 'accepted', 'rejected', 'paid', 'not agreed']
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
  }

  if (!searchType && searchText.length <= 0) {
    searchType = 'reset'
  }
  if (searchType) {
    return {
      searchText,
      searchType
    }
  } else {
    throw new Error('Invalid search. It should be application reference or status or sbi number.')
  }
}
