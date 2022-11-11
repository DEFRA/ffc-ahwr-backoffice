const { formatedDateToUk, upperFirstLetter } = require('../../lib/display-helper')
const speciesNumbers = require('../../../app/constants/species-numbers')

module.exports = (application) => {
  const { data, createdAt, status } = application
  const formatedDate = formatedDateToUk(createdAt)
  return {
    firstCellIsHeader: true,
    rows: [
      [{ text: status.status === 'REJECTED' || status.status === 'NOT AGREED' ? 'Agreement not formed' : 'Agreement formed' }, { text: formatedDate }],
      [{ text: 'Business details correct' }, { text: upperFirstLetter(data.confirmCheckDetails) }],
      [{ text: 'Type of review' }, { text: upperFirstLetter(data.whichReview) }],
      [{ text: 'Number of livestock' }, { text: speciesNumbers[data.whichReview] }],
      [{ text: 'Agreement accepted' }, { text: data.declaration ? 'Yes' : 'No' }]
    ]
  }
}
