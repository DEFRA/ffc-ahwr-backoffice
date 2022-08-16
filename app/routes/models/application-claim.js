const { formatedDateToUk } = require('../../lib/display-helper')

module.exports = (updatedAt) => {
  const formatedDate = formatedDateToUk(updatedAt)
  return {
    head: [{ text: 'Date' }, { text: 'Data requested' }, { text: 'Data entered' }],
    rows: [
      [{ text: formatedDate }, { text: 'Details correct?' }, { text: 'Yes' }]
    ]
  }
}
