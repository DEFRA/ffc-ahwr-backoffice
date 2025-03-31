const {
  agreed,
  withdrawn,
  readyToPay,
  rejected,
  inCheck,
  onHold,
  recommendToPay,
  recommendToReject,
} = require("../../../app/constants/application-status");
const { formatedDateToUk } = require("../../lib/display-helper");

const getAction = (updatedProperty, newValue, oldValue) => {
  const statusIds = {
    [agreed]: "Agreed",
    [withdrawn]: "Withdrawn",
    [readyToPay]: "Approved",
    [rejected]: "Rejected",
    [inCheck]: "Moved to 'In Check'",
    [onHold]: "Moved to 'On Hold'",
    [recommendToPay]: "Recommended to Pay",
    [recommendToReject]: "Recommended to Reject",
  };

  if (updatedProperty === "statusId") {
    return statusIds[newValue];
  }

  const dataProperties = {
    vetsName: `Vet updated from ${oldValue} to ${newValue}`,
    vetName: `Vet updated from ${oldValue} to ${newValue}`,
    vetRCVSNumber: `RCVS updated from ${oldValue} to ${newValue}`,
    vetRcvs: `RCVS updated from ${oldValue} to ${newValue}`,
    dateOfVisit: `Visit date updated from ${formatedDateToUk(oldValue)} to ${formatedDateToUk(newValue)}`,
    visitDate: `Visit date updated from ${formatedDateToUk(oldValue)} to ${formatedDateToUk(newValue)}`,
  };

  return dataProperties[updatedProperty];
};

const gethistoryTableHeader = () => [
  { text: "Date" },
  { text: "Time" },
  { text: "Action" },
  { text: "User" },
  { text: "Note", classes: "govuk-!-width-one-quarter" },
];

const gethistoryTableRows = (historyRecords) =>
  historyRecords.map(
    ({ updatedProperty, newValue, oldValue, updatedAt, updatedBy, note }) => {
      const action = getAction(updatedProperty, newValue, oldValue);

      const updatedDate = new Date(updatedAt);
      return [
        {
          text: updatedDate.toLocaleString("en-GB", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          }),
        },
        {
          text: updatedDate.toLocaleString("en-GB", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          }),
        },
        { text: action },
        { text: updatedBy },
        { text: note },
      ];
    },
  );

const getHistoryDetails = (historyRecords) => ({
  header: gethistoryTableHeader(),
  rows: gethistoryTableRows(historyRecords),
});

module.exports = { getHistoryDetails };
