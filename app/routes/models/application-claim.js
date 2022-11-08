const { formatedDateToUk } = require('../../lib/display-helper')

module.exports = (application) => {
  const { data } = application
  const formatedDate = formatedDateToUk(application.updatedAt)
  return {
    head: [{ text: 'Date' }, { text: 'Data requested' }, { text: 'Data entered' }],
    rows: [
      [{ text: formatedDate }, { text: 'Details correct?' }, { text: data?.confirmCheckDetails }],
      [{ text: formatedDate }, { text: 'Date of review' }, { text: formatedDateToUk(data?.visitDate) }],
      [{ text: formatedDate }, { text: 'Vet’s name' }, { text: data?.vetName }],
      [{ text: formatedDate }, { text: 'Vet’s RCVS number' }, { text: data?.vetRcvs }],
      [{ text: formatedDate }, { text: 'Unique reference number (URN)' }, { text: data?.urnResult }]
    ]
  }
}
