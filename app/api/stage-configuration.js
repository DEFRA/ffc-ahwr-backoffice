const Wreck = require('@hapi/wreck')
const { applicationApiUri } = require('../config')

async function getAllStageConfigurations () {
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

async function getStageConfigurationById (id) {
  const url = `${applicationApiUri}/stageconfiguration/${id}`
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

module.exports = {
  getAllStageConfigurations,
  getStageConfigurationById
}
