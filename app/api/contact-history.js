const Wreck = require('@hapi/wreck')
const _ = require('lodash')
const { applicationApiUri } = require('../config')

async function getContactHistory (reference) {
  const url = `${applicationApiUri}/application/contact-history/${reference}`
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

const getContactFieldData = (contactHistoryData, field) => {
  const filteredData = contactHistoryData.filter(contact => contact?.data?.field === field)
  if (filteredData.length) {
    return _.sortBy(filteredData, [function (x) { return new Date(x.createdAt) }])[filteredData.length - 1].data.oldValue
  } else {
    return 'NA'
  }
}

const displayContactHistory = (contactHistory) => {
  if (contactHistory) {
    const orgEmail = getContactFieldData(contactHistory, 'orgEmail')
    const email = getContactFieldData(contactHistory, 'email')
    const farmerName = getContactFieldData(contactHistory, 'farmerName')
    const address = getContactFieldData(contactHistory, 'address')
    return {
      orgEmail,
      email,
      farmerName,
      address
    }
  } else {
    return {
      orgEmail: 'NA',
      email: 'NA',
      farmerName: 'NA',
      address: 'NA'
    }
  }
}

module.exports = {
  getContactHistory,
  displayContactHistory
}
