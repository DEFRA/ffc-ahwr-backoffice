const wreck = require('@hapi/wreck')
const _ = require('lodash')
const { applicationApiUri } = require('../config')
const { fieldsNames, labels, notAvailable } = require('./../constants/contact-history')

async function getContactHistory (reference, logger) {
  const endpoint = `${applicationApiUri}/application/contact-history/${reference}`
  try {
    const { payload } = await wreck.get(endpoint, { json: true })

    return payload
  } catch (err) {
    logger.setBindings({ err, endpoint })
    throw err
  }
}

const getContactFieldData = (contactHistoryData, field) => {
  const filteredData = contactHistoryData.filter(contact => contact.data?.field === field)
  if (filteredData.length) {
    const oldValue = _.sortBy(filteredData, [function (data) { return new Date(data.createdAt) }])[0].data.oldValue
    return `${labels[field]} ${oldValue}`
  } else {
    return 'NA'
  }
}

const displayContactHistory = (contactHistory) => {
  if (contactHistory) {
    const orgEmail = getContactFieldData(contactHistory, fieldsNames.orgEmail)
    const email = getContactFieldData(contactHistory, fieldsNames.email)
    const address = getContactFieldData(contactHistory, fieldsNames.address)
    return {
      orgEmail,
      email,
      address
    }
  } else {
    return {
      orgEmail: notAvailable,
      email: notAvailable,
      address: notAvailable
    }
  }
}

module.exports = {
  getContactHistory,
  displayContactHistory
}
