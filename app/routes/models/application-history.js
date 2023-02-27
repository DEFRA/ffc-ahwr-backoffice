const applicationStatus = require('../../../app/constants/application-status')

const getStatusText = (status) => {
  switch (status) {
    case applicationStatus.agreed:
      return 'Agreement agreed'
    case applicationStatus.withdrawn:
      return 'Withdraw completed'
    case applicationStatus.dataInputted:
      return 'Data inputted'
    case applicationStatus.claimed:
      return 'Claimed'
    case applicationStatus.inCheck:
      return 'Claim in check'
    case applicationStatus.accepted:
      return 'Agreement accepted'
    case applicationStatus.notAgreed:
      return 'Agreement not agreed'
    case applicationStatus.paid:
      return 'Claim paid'
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
  return applicationHistory.historyRecords.map(hr => {
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
