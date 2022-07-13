const Wreck = require('@hapi/wreck')
const { applicationApiUri } = require('../config')
async function getApplication (reference) {
  const url = `${applicationApiUri}/application/get/${reference}`
  try {
    const response = await Wreck.get(url, { json: true })
    if (response.res.statusCode !== 200) {
      return null
    }
    return response.payload
  } catch (err) {
    console.log(err)
    return null
  }
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
  try {
    const response = await Wreck.post(url, options)
    if (response.res.statusCode !== 200) {
      return { applications: [], total: 0 }
    }
    return response.payload
  } catch (err) {
    console.log(err)
    return { applications: [], total: 0 }
  }
}
module.exports = {
  getApplications,
  getApplication
}
