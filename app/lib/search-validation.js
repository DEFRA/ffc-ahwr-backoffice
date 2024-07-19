const regexChecker = require('../../app/routes/utils/regex-checker')

const refRegEx = /^(IAHW|AHWR|REPI|RESH|REBC|REDC|FUPI|FUSH|FUBC|FUDC)-[A-Z0-9]{4}-[A-Z0-9]{4}$/i
const dateRegEx = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/ // DD/MM/YYYY
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
const validTypes = ['review', 'endemics']
const validSpecies = (searchText) => {
  const species = {
    'Beef cattle': 'beef',
    'Dairy cattle': 'dairy',
    Sheep: 'sheep',
    Pigs: 'pigs'
  }

  if (searchText.length <= 0) return { isValidSpecies: false, theSpecies: '' }
  let theSpecies
  Object.keys(species).forEach(key => {
    if (key.toLowerCase() === searchText.toLowerCase()) {
      theSpecies = species[key]
    }
  })

  return { isValidSpecies: !!theSpecies, theSpecies: theSpecies ?? '' }
}

module.exports = (searchText) => {
  let searchType
  searchText = (searchText ?? '').trim()
  const { isValidSpecies, theSpecies } = validSpecies(searchText)

  switch (true) {
    case regexChecker(refRegEx, searchText):
      searchType = 'ref'
      break
    case validStatus.indexOf(searchText.toLowerCase()) !== -1:
      searchType = 'status'
      break
    case sbiRegEx.test(searchText):
      searchType = 'sbi'
      break
    case regexChecker(dateRegEx, searchText):
      searchType = 'date'
      break
    case validTypes.indexOf(searchText.toLowerCase()) !== -1:
      searchType = 'type'
      searchText = validTypes[validTypes.indexOf(searchText.toLowerCase())] === 'review' ? 'R' : 'E'
      break
    case isValidSpecies:
      searchType = 'species'
      searchText = theSpecies
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
