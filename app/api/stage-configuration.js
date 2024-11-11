const wreck = require('@hapi/wreck')
const { applicationApiUri } = require('../config')

async function getAllStageConfigurations (logger) {
  const endpoint = `${applicationApiUri}/stageconfiguration`
  try {
    const { payload } = await wreck.get(endpoint, { json: true })
    return payload
  } catch (err) {
    logger.setBindings({ err, endpoint })
    throw err
  }
}

module.exports = {
  getAllStageConfigurations
}
