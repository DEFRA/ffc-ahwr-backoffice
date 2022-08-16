const { formatedDateToUk } = require('../../lib/display-helper')

module.exports = (payment) => {
  const { data, createdAt } = payment
  const formatedDate = formatedDateToUk(createdAt)
  const rows = []
  data.invoiceLines.forEach(invoiceLine => {
    rows.push([{ text: formatedDate }, { text: invoiceLine.description }, { text: `£${data?.value?.toFixed(2)}` }])
  })

  if (data.frn) {
    rows.push([{ text: formatedDate }, { text: 'FRN number' }, { text: data.frn }])
  }

  if (data.invoiceNumber) {
    rows.push([{ text: formatedDate }, { text: 'Invoice number' }, { text: data.invoiceNumber }])
  }

  return {
    head: [{ text: 'Date' }, { text: 'Data requested' }, { text: 'Data entered' }],
    rows
  }
}