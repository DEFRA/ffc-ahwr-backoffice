const Wreck = require('@hapi/wreck')
const { applicationApiUri } = require('../config')
async function getApplication (reference) {
  const url = `${applicationApiUri}/application/get/${reference}`
  const response = await Wreck.get(url, { json: true })
  return response.payload
}
async function getApplications (searchType, searchText, limit, offset) {
  const url = `${applicationApiUri}/application/search`
  const options = {
    payload: {
      search: { text: searchText, type: searchType },
      limit,
      offset
    },
    json: true
  }
  const response = await Wreck.post(url, options)
  return response.payload
}
module.exports = {
  getApplications,
  getApplication
}
