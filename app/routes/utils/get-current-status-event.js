
const getCurrentStatusEvent = (application, applicationHistory) => {
  const mostRecentStatusUpdate = applicationHistory
    .historyRecords
    .findLast(({ EventType }) => (EventType === 'status-updated'))

  const isToCurrentStatus =
    mostRecentStatusUpdate &&
    JSON.parse(mostRecentStatusUpdate.Payload).statusId === application.statusId

  return isToCurrentStatus
    ? mostRecentStatusUpdate
    : null
}

module.exports = { getCurrentStatusEvent }
