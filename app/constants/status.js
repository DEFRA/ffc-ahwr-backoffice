const status = {
  APPLIED: {
    styleClass: 'govuk-tag--green'
  },
  AGREED: {
    styleClass: 'govuk-tag--green'
  },
  WITHDRAWN: {
    styleClass: 'govuk-tag--grey'
  },
  PAID: {
    styleClass: 'govuk-tag--blue'
  },
  DATAINPUTTED: {
    styleClass: 'govuk-tag--yellow'
  },
  REJECTED: {
    styleClass: 'govuk-tag--red'
  },
  NOTAGREED: {
    styleClass: 'govuk-tag--pink'
  },
  ACCEPTED: {
    styleClass: 'govuk-tag--purple'
  },
  CHECK: {
    styleClass: 'govuk-tag--orange'
  },
  CLAIMED: {
    styleClass: 'govuk-tag--blue'
  },
  INCHECK: {
    styleClass: 'govuk-tag--orange'
  },
  READYTOPAY: {
    styleClass: 'govuk-tag'
  }
}

const getStyleClassByStatus = (value) => {
  value = value.replace(/\s/g, '')
  const v = Object.keys(status).map(i => i === value)
  if (v.filter(s => s === true).length > 0) {
    return status[value].styleClass
  } else { return 'govuk-tag--orange' }
}

module.exports = getStyleClassByStatus
