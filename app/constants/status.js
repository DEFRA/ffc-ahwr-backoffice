const status = {
  APPLIED: {
    styleClass: 'govuk-tag--grey'
  },
  WITHDRAWN: {
    styleClass: 'govuk-tag--brown'
  },
  PAID: {
    styleClass: 'govuk-tag--blue'
  },
  DATAINPUTED: {
    styleClass: 'govuk-tag--blue'
  },
  REJECTED: {
    styleClass: 'govuk-tag--red'
  },
  ACCEPTED: {
    styleClass: 'govuk-tag--blue'
  },
  CHECK: {
    styleClass: 'govuk-tag--blue'
  },
  CLAIMED: {
    styleClass: 'govuk-tag--blue'
  }
}

const getStyleClassByStatus = (value) => {
  value = value.replace(/\s/g, '')
  const v = Object.keys(status).map(i => i === value)
  if (v.filter(s => s === true).length > 0) {
    return status[value].styleClass
  } else { return 'govuk-tag--grey' }
}

module.exports = getStyleClassByStatus
