const Wreck = require('@hapi/wreck')
const { applicationApiUri } = require('../config')

async function getAllStageExecutions () {
  const url = `${applicationApiUri}/stageexecution`
  console.log('Application API: Getting all stage executions')
  try {
    const response = await Wreck.get(url, { json: true })
    if (response.res.statusCode !== 200) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
    return response.payload
  } catch (err) {
    console.log(`Application API: Error while getting all stage executions: ${err.message}`)
    console.error(err)
    return []
  }
}

async function getStageExecutionByApplication (applicationReference) {
  const url = `${applicationApiUri}/stageexecution/${applicationReference}`
  try {
    const response = await Wreck.get(url, { json: true })
    if (response.res.statusCode !== 200) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
    console.log(`Application API: Got stage executions by application ${applicationReference}: ${response.payload}`)
    return response.payload
  } catch (err) {
    console.log(`Application API: Error while getting stage executions by application ${applicationReference}: ${err.message}`)
    console.error(err)
    return []
  }
}

async function addStageExecution (payload) {
  const url = `${applicationApiUri}/stageexecution`
  console.log(`Application API: Adding stage execution, ${JSON.stringify(payload)}`)
  const options = {
    payload,
    json: true
  }
  try {
    const response = await Wreck.post(url, options)
    if (response.res.statusCode !== 200) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
    return response.payload
  } catch (err) {
    console.log(`Application API: Error while adding stage execution: ${err.message}`)
    console.error(err)
    return []
  }
}

async function updateStageExecution (id) {
  const url = `${applicationApiUri}/stageexecution/${id}`
  console.log(`Application API: Updating stage execution ${id}`)
  const options = {
    json: true
  }
  try {
    const response = await Wreck.put(url, options)
    if (response.res.statusCode !== 200) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
    return response.payload
  } catch (err) {
    console.log(`Application API: Error while updating stage execution: ${err.message}`)
    console.error(err)
    return []
  }
}

module.exports = {
  getAllStageExecutions,
  getStageExecutionByApplication,
  addStageExecution,
  updateStageExecution
}
