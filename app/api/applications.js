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
async function getApplications (searchType, searchText, limit, offset, filterStatus) {
  const url = `${applicationApiUri}/application/search`
  const options = {
    payload: {
      search: { text: searchText, type: searchType },
      limit,
      offset,
      filter: filterStatus
    },
    json: true
  }
  try {
    const response = await Wreck.post(url, options)
    if (response.res.statusCode !== 200) {
      return { applications: [], total: 0, applicationStatus: [] }
    }
    return response.payload
  } catch (err) {
    console.log(err)
    return { applications: [], total: 0, applicationStatus: [] }
  }
}
async function submitApplicationPayment (reference, paid) {
  const url = `${applicationApiUri}/application/payment/${reference}`
  const options = {
    payload: {
      paid
    },
    json: true
  }
  try {
    const response = await Wreck.post(url, options)

    return response.res.statusCode === 200
  } catch (err) {
    console.log(err)
    return false
  }
}
async function submitApplicationFraudCheck (reference, accepted) {
  const url = `${applicationApiUri}/application/fraud/${reference}`
  const options = {
    payload: {
      accepted
    },
    json: true
  }
  try {
    const response = await Wreck.post(url, options)
    return response.res.statusCode === 200
  } catch (err) {
    console.log(err)
    return false
  }
}
module.exports = {
  getApplications,
  getApplication,
  submitApplicationPayment,
  submitApplicationFraudCheck
}
