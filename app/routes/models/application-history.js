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
const { formattedDateToUk } = require("../../lib/display-helper");

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
    dateOfVisit: `Date of visit updated from ${formattedDateToUk(oldValue)} to ${formattedDateToUk(newValue)}`,
    visitDate: `Date of review updated from ${formattedDateToUk(oldValue)} to ${formattedDateToUk(newValue)}`,
    agreementFlag: `Agreement was moved from ${oldValue} to ${newValue}`,
    testResults: `Test results updated from ${oldValue} to ${newValue}`,
  };

  return dataProperties[updatedProperty];
};

const getHistoryTableHeader = () => [
  { text: "Date" },
  { text: "Time" },
  { text: "Action" },
  { text: "User" },
  { text: "Note", classes: "govuk-!-width-one-quarter" },
];

const getHistoryTableRows = (historyRecords) =>
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
  header: getHistoryTableHeader(),
  rows: getHistoryTableRows(historyRecords),
});

module.exports = { getHistoryDetails };
