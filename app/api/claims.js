const wreck = require('@hapi/wreck')
const { applicationApiUri } = require('../config')

async function getClaim (reference, logger) {
  const endpoint = `${applicationApiUri}/claim/get-by-reference/${reference}`
  try {
    const { payload } = await wreck.get(endpoint, { json: true })
    return payload
  } catch (err) {
    logger.setBindings({ err, endpoint })
    throw err
  }
}

async function getClaims (searchType, searchText, filter, limit, offset, sort, logger) {
  const endpoint = `${applicationApiUri}/claim/search`
  const options = {
    payload: {
      search: { text: searchText, type: searchType },
      filter,
      limit,
      offset,
      sort
    },
    json: true
  }
  try {
    const { payload } = await wreck.post(endpoint, options)
    return payload
  } catch (err) {
    logger.setBindings({ err, endpoint })
    throw err
  }
}

async function updateClaimStatus (reference, user, status, logger, note) {
  const endpoint = `${applicationApiUri}/claim/update-by-reference`
  const options = {
    payload: {
      reference,
      status,
      user,
      note
    },
    json: true
  }
  try {
    const { payload } = await wreck.put(endpoint, options)
    return payload
  } catch (err) {
    logger.setBindings({ err, endpoint })
    throw err
  }
}

module.exports = {
  getClaim,
  getClaims,
  updateClaimStatus
}
