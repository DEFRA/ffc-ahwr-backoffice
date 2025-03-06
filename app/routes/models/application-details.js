const { formatedDateToUk, upperFirstLetter } = require('../../lib/display-helper')
const speciesNumbers = require('../../constants/species-numbers')

const getApplicationDetails = (application, statusRow) => {
  const { data, createdAt, status } = application
  const formatedDate = formatedDateToUk(createdAt)

  return [
    statusRow,
    { key: { text: status.status === 'NOT AGREED' ? 'Date agreement rejected' : 'Date of agreement' }, value: { text: formatedDate } },
    { key: { text: 'Business details correct' }, value: { text: upperFirstLetter(data.confirmCheckDetails) } },
    { key: { text: 'Type of review' }, value: { text: upperFirstLetter(data.whichReview) } },
    { key: { text: 'Number of livestock' }, value: { text: speciesNumbers[data.whichReview] } },
    { key: { text: 'Agreement accepted' }, value: { text: data.offerStatus === 'accepted' ? 'Yes' : 'No' } }
  ]
}

module.exports = { getApplicationDetails }
