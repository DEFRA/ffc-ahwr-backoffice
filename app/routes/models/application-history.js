const moment = require('moment')
const applicationStatus = require('../../../app/constants/application-status')

const formatDate = (dateToFormat, currentDateFormat = 'YYYY-MM-DD', dateFormat = 'DD/MM/YYYY HH:mm') => {
  if (dateToFormat) {
    return moment(dateToFormat, currentDateFormat).utc().format(dateFormat)
  }
  return ''
}

const parseData = (payload, key) => {
  let value = ''
  const data = payload ? JSON.parse(payload) : {}

  try {
    value = data[key]
  } catch (error) {
    console.log(`${key} not found`)
  }

  return value
}

const filterRecords = (applicationHistory) => {
  return [
    ...(applicationHistory.historyRecords?.filter(apphr =>
      [
        applicationStatus.withdrawn,
        applicationStatus.readyToPay,
        applicationStatus.rejected,
        applicationStatus.onHold,
        applicationStatus.inCheck,
        applicationStatus.recommendToPay,
        applicationStatus.recommendToReject
      ].includes(parseData(apphr.Payload, 'statusId'))
    ) || [])
  ]
}

const getStatusText = (status, subStatus) => {
  switch (status) {
    case applicationStatus.withdrawn:
      return 'Withdraw completed'
    case applicationStatus.readyToPay:
      return subStatus || 'Claim approved'
    case applicationStatus.rejected:
      return subStatus || 'Claim rejected'
    case applicationStatus.inCheck:
      return subStatus === undefined ? 'Moved to In Check' : subStatus
    case applicationStatus.onHold:
      return subStatus || 'On Hold'
    case applicationStatus.recommendToPay:
      return "Claim moved to 'recommended to pay'"
    case applicationStatus.recommendToReject:
      return "Claim moved to 'recommended to reject'"
    default:
      return ''
  }
}

const gethistoryTableHeader = () => {
  return [{ text: 'Date' }, { text: 'Time' }, { text: 'Action' }, { text: 'User' }]
}

const gethistoryTableRows = (applicationHistory) => {
  const historyRecords = filterRecords(applicationHistory)

  historyRecords.sort((a, b) => {
    return new Date(a.ChangedOn) - new Date(b.ChangedOn)
  })

  return historyRecords?.map(hr => {
    return [
      { text: formatDate(hr.ChangedOn, moment.ISO_8601, 'DD/MM/YYYY') },
      { text: formatDate(hr.ChangedOn, moment.ISO_8601, 'HH:mm:ss') },
      { text: getStatusText(parseData(hr.Payload, 'statusId'), parseData(hr.Payload, 'subStatus')) },
      { text: hr.ChangedBy }
    ]
  })
}

module.exports = (applicationHistory) => {
  return {
    header: gethistoryTableHeader(),
    rows: gethistoryTableRows(applicationHistory)
  }
}
