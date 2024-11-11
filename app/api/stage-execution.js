const wreck = require('@hapi/wreck')
const { applicationApiUri } = require('../config')

async function getStageExecutionByApplication (applicationReference, logger) {
  const endpoint = `${applicationApiUri}/stageexecutions/${applicationReference}`
  try {
    const { payload } = await wreck.get(endpoint, { json: true })

    return payload
  } catch (err) {
    if (err.output.statusCode === 404) {
      return []
    } else {
      logger.setBindings({ err, endpoint })
      throw err
    }
  }
}

async function addStageExecution (payload, logger) {
  const endpoint = `${applicationApiUri}/stageexecution`
  const options = {
    payload,
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

async function updateStageExecution (id, logger) {
  const endpoint = `${applicationApiUri}/stageexecution/${id}`
  const options = {
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
  getStageExecutionByApplication,
  addStageExecution,
  updateStageExecution
}
