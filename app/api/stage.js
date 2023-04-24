const Wreck = require('@hapi/wreck')
const { applicationApiUri } = require('../config')

async function getStageConfiguration () {
  const url = `${applicationApiUri}/stageconfiguration`
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
async function getStageExecution () {
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

async function createStageExecution (applicationReference, stageConfigurationId, user, action) {
  const url = `${applicationApiUri}/stageexecution`
  const options = {
    payload: {
      applicationReference,
      stageConfigurationId,
      user,
      action
    },
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
    return false
  }
}

async function updateStageExecution (id) {
  const url = `${applicationApiUri}/stageexecution/${id}`
  const options = {
    json: true
  }
  try {
    await Wreck.put(url, options)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}

module.exports = {
  getStageConfiguration,
  getStageExecution,
  createStageExecution,
  updateStageExecution
}
