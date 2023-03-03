const applicationStatus = require('../../../app/constants/application-status')

const getStatusText = (status) => {
  switch (status) {
    case applicationStatus.withdrawn:
      return 'Withdraw completed'
    case applicationStatus.readyToPay:
      return 'Claim approved'
    case applicationStatus.rejected:
      return 'Claim rejected'
    default:
      return ''
  }
}

const gethistoryTableHeader = () => {
  return [{ text: 'Date' }, { text: 'Time' }, { text: 'Action' }, { text: 'User' }]
}

const gethistoryTableRows = (applicationHistory) => {
  const historyTabAllowedStatus = [applicationStatus.withdrawn, applicationStatus.readyToPay, applicationStatus.rejected]
  const historyRecords = []

  applicationHistory.historyRecords?.forEach(hr => {
    if (historyTabAllowedStatus.includes(hr.statusId)) {
      historyRecords.push(hr)
    }
  })

  return historyRecords.map(hr => {
    return [
      { text: hr.date },
      { text: hr.time },
      { text: getStatusText(hr.statusId) },
      { text: hr.user }
    ]
  })
}

module.exports = (applicationHistory) => {
  return {
    header: gethistoryTableHeader(),
    rows: gethistoryTableRows(applicationHistory)
  }
}
