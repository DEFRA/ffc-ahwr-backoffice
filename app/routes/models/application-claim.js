const { formatedDateToUk, upperFirstLetter } = require('../../lib/display-helper')

module.exports = (application) => {
  const { data } = application
  return {
    firstCellIsHeader: true,
    rows: [
      [{ text: 'Review details confirmed' }, { text: upperFirstLetter(data?.confirmCheckDetails) }],
      [{ text: 'Date of review' }, { text: formatedDateToUk(data?.visitDate) }],
      [{ text: 'Vet’s name' }, { text: data?.vetName }],
      [{ text: 'Vet’s RCVS number' }, { text: data?.vetRcvs }],
      [{ text: 'Unique reference number (URN)' }, { text: data?.urnResult }]
    ]
  }
}
