const Wreck = require('@hapi/wreck')
const { applicationApiUri } = require('../config')

async function getClaim (reference) {
  const url = `${applicationApiUri}/claim/get-by-reference/${reference}`
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

async function getClaims (reference) {
  const url = `${applicationApiUri}/claim/get-by-application-reference/${reference}`
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

async function processClaim (reference, user, approved) {
  const url = `${applicationApiUri}/application/claim`
  const options = {
    payload: {
      reference,
      user,
      approved
    },
    json: true
  }
  try {
    await Wreck.post(url, options)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}

async function updateClaimStatus (reference, user, status) {
  const url = `${applicationApiUri}/application/${reference}`
  const options = {
    payload: {
      user,
      status
    },
    json: true
  }
  try {
    const response = await Wreck.put(url, options)
    if (response.res.statusCode !== 200) {
      return null
    }
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}

module.exports = {
  getClaims,
  getClaim,
  processClaim,
  updateClaimStatus
}
