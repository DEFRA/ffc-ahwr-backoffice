const { withdrawn, readyToPay, rejected, inCheck, onHold, recommendToPay, recommendToReject} = require("../../../app/constants/application-status");

const getAction = (updatedProperty, newValue, oldValue) => {
  const statusIds = {
    [withdrawn]: "Withdrawn",
    [readyToPay]: "Approved",
    [rejected]: "Rejected",
    [inCheck]: "Moved to 'In Check'",
    [onHold]: "Moved to 'On Hold'",
    [recommendToPay]: "Recommended to Pay",
    [recommendToReject]: "Recommended to Reject"
  }

  if (updatedProperty === 'statusId') {
    return statusIds[newValue]
  }

  const dataProperties = {
    vetsName: `Vet updated from ${oldValue} to ${newValue}`,
    vetRCVSNumber: `RCVS updated from ${oldValue} to ${newValue}`,
    dateOfVisit: `Visit date updated from ${oldValue} to ${newValue}`
  }

  return dataProperties[updatedProperty]
}

const gethistoryTableHeader = () => {
  return [
    { text: "Date" },
    { text: "Time" },
    { text: "Action" },
    { text: "User" },
    { text: "Note", classes: "govuk-!-width-one-quarter" }
  ]
}

const gethistoryTableRows = (historyRecords) => {
  return historyRecords.map(({ updatedProperty, newValue, oldValue, updatedAt, updatedBy, note }) => {

    const action = getAction(updatedProperty, newValue, oldValue)
    const updatedDate = new Date(updatedAt)
    return [
      { text: updatedDate.toLocaleString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }) },
      { text: updatedDate.toLocaleString('en-GB', { hour: 'numeric', minute: 'numeric', second: 'numeric' }) },
      { text: action },
      { text: updatedBy },
      { text: note }
    ];
  });
};

const getHistoryDetails = (historyRecords) => ({
  header: gethistoryTableHeader(),
  rows: gethistoryTableRows(historyRecords)
})

module.exports = { getHistoryDetails }
