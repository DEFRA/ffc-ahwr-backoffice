const moment = require('moment')
const applicationStatus = require('../../../app/constants/application-status')
const stageExecutionActions = require('../../../app/constants/application-stage-execution-actions')

const formatDate = (dateToFormat, currentDateFormat = 'YYYY-MM-DD', dateFormat = 'DD/MM/YYYY HH:mm') => {
  if (dateToFormat) {
    return moment(dateToFormat, currentDateFormat).utc().format(dateFormat)
  }
  return ''
}

const parseData = (payload, key) => {
  let value = ''

  try {
    value = payload[key]
  } catch (error) {
    console.log(`${key} not found`)
  }
  console.log(`${key} = ${value}`)
  return value
}

const filterRecords = (applicationHistory) => {
  const historyTabAllowedStatus = [
    applicationStatus.withdrawn,
    applicationStatus.readyToPay,
    applicationStatus.rejected,
    stageExecutionActions.recommendToPay,
    stageExecutionActions.recommendToReject,
    stageExecutionActions.authorisePayment,
    stageExecutionActions.authoriseRejection
  ]
  const historyRecords = []
  console.log(applicationHistory, 'filtering record')
  applicationHistory.forEach(apphr => {
    if (historyTabAllowedStatus.includes(parseData(apphr.Payload, 'statusId'))) {
      historyRecords.push(apphr)
    }
  })

  return historyRecords
}

const getStatusText = (status) => {
  switch (status) {
    case applicationStatus.withdrawn:
      return 'Withdraw completed'
    case applicationStatus.readyToPay:
      return 'Claim approved'
    case applicationStatus.rejected:
      return 'Claim rejected'
    case stageExecutionActions.recommendToPay:
      return 'Recommend to pay'
    case stageExecutionActions.recommendToReject:
      return 'Recommend to reject'
    case stageExecutionActions.authorisePayment:
      return 'Authorised to pay'
    case stageExecutionActions.authoriseRejection:
      return 'Authorised to reject'
    default:
      return ''
  }
}

const gethistoryTableHeader = () => {
  return [{ text: 'Date' }, { text: 'Time' }, { text: 'Action' }, { text: 'User' }]
}

const gethistoryTableRows = (applicationHistory) => {
  applicationHistory = JSON.parse(Buffer.from(applicationHistory).toString('utf-8'))
  const historyRecords = filterRecords(applicationHistory)

  return historyRecords?.map(hr => {
    return [
      { text: formatDate(hr.ChangedOn, moment.ISO_8601, 'DD/MM/YYYY') },
      { text: formatDate(hr.ChangedOn, moment.ISO_8601, 'HH:mm:ss') },
      { text: getStatusText(parseData(hr.Payload, 'statusId')) },
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
