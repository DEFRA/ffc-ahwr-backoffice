const { upperFirstLetter } = require('../../lib/display-helper')

const statusUpdateOptions = {
  IN_CHECK: 5,
  RECOMMENDED_TO_PAY: 12,
  RECOMMENDED_TO_REJECT: 13
}

const getStatusUpdateOptions = (statusId) => Object
  .entries(statusUpdateOptions)
  .filter(([_, value]) => value !== statusId)
  .map(([key, value]) => ({
    text: upperFirstLetter(key.toLowerCase()).replace(/_/g, ' '),
    value
  }))

module.exports = { getStatusUpdateOptions }
