const { formatedDateToUk, upperFirstLetter } = require('../../lib/display-helper')

module.exports = (application) => {
  const { data, updatedAt } = application
  const formatedDate = formatedDateToUk(updatedAt)
  return {
    firstCellIsHeader: true,
    rows: [
      [{ text: 'Date of claim' }, { text: formatedDate }],
      [{ text: 'Review details confirmed' }, { text: upperFirstLetter(data?.confirmCheckDetails) }],
      [{ text: 'Date of review' }, { text: formatedDateToUk(data?.visitDate) }],
      [{ text: 'Vet’s name' }, { text: data?.vetName }],
      [{ text: 'Vet’s RCVS number' }, { text: data?.vetRcvs }],
      [{ text: 'Test results unique reference number (URN)' }, { text: data?.urnResult }]
    ]
  }
}
