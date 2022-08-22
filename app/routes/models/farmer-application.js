const { formatedDateToUk, upperFirstLetter } = require('../../lib/display-helper')
const speciesNumbers = require('../../../app/constants/species-numbers')

module.exports = (application) => {
  const { data, createdAt } = application
  const formatedDate = formatedDateToUk(createdAt)
  return {
    head: [{ text: 'Date' }, { text: 'Data requested' }, { text: 'Data entered' }],
    rows: [
      [{ text: formatedDate }, { text: 'Detail correct?' }, { text: upperFirstLetter(data.confirmCheckDetails) }],
      [{ text: formatedDate }, { text: 'Review type' }, { text: upperFirstLetter(data.whichReview) }],
      [{ text: formatedDate }, { text: 'Livestock number' }, { text: speciesNumbers[data.whichReview] }],
      [{ text: formatedDate }, { text: 'T&Cs agreed?' }, { text: data.declaration ? 'Yes' : 'No' }]
    ]
  }
}
