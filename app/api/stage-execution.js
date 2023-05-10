const Wreck = require('@hapi/wreck')
const { applicationApiUri } = require('../config')

async function getAllStageExecutions () {
  const url = `${applicationApiUri}/stageexecution`
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
async function addStageExecution (payload) {
  const url = `${applicationApiUri}/stageexecution`
  const options = {
    payload,
    json: true
  }
  try {
    const response = await Wreck.post(url, options)
    if (response.res.statusCode !== 200) {
      return null
    }
    return response.payload
  } catch (err) {
    console.log(err)
    return null
  }
}

async function updateStageExecution (id) {
  const url = `${applicationApiUri}/stageexecution/${id}`
  const options = {
    json: true
  }
  try {
    const response = await Wreck.put(url, options)
    return response.payload
  } catch (err) {
    console.log(err)
    return null
  }
}

module.exports = {
  getAllStageExecutions,
  addStageExecution,
  updateStageExecution
}
