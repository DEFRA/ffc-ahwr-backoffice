const moment = require("moment");
const applicationStatus = require("../../../app/constants/application-status");

const formatDate = (
  dateToFormat,
  currentDateFormat = "YYYY-MM-DD",
  dateFormat = "DD/MM/YYYY HH:mm",
) => {
  if (dateToFormat) {
    return moment(dateToFormat, currentDateFormat).utc().format(dateFormat);
  }
  return "";
};

const filterRecords = (applicationHistory) =>
  applicationHistory.historyRecords.filter((apphr) =>
    [
      applicationStatus.withdrawn,
      applicationStatus.readyToPay,
      applicationStatus.rejected,
      applicationStatus.onHold,
      applicationStatus.inCheck,
      applicationStatus.recommendToPay,
      applicationStatus.recommendToReject,
    ].includes(JSON.parse(apphr.Payload).statusId),
  );

const getStatusText = (status, subStatus) => {
  switch (status) {
    case applicationStatus.withdrawn:
      return "Withdrawn";
    case applicationStatus.readyToPay:
      return subStatus || "Approved";
    case applicationStatus.rejected:
      return subStatus || "Rejected";
    case applicationStatus.inCheck:
      return subStatus === undefined ? "Moved to 'In Check'" : subStatus;
    case applicationStatus.onHold:
      return subStatus || "On Hold";
    case applicationStatus.recommendToPay:
      return "Moved to 'Recommended to Pay'";
    case applicationStatus.recommendToReject:
      return "Moved to 'Recommended to Reject'";
    default:
      return "";
  }
};

const gethistoryTableHeader = () => {
  return [
    { text: "Date" },
    { text: "Time" },
    { text: "Action" },
    { text: "User" },
    { text: "Note" },
  ];
};

const gethistoryTableRows = (applicationHistory) => {
  const historyRecords = filterRecords(applicationHistory);

  return historyRecords.map(({ ChangedOn, ChangedBy, Payload }) => {
    const { statusId, subStatus, note } = JSON.parse(Payload);

    return [
      { text: formatDate(ChangedOn, moment.ISO_8601, "DD/MM/YYYY") },
      { text: formatDate(ChangedOn, moment.ISO_8601, "HH:mm:ss") },
      { text: getStatusText(statusId, subStatus) },
      { text: ChangedBy },
      { text: note },
    ];
  });
};

const getHistoryDetails = (applicationHistory) => {
  return {
    header: gethistoryTableHeader(),
    rows: gethistoryTableRows(applicationHistory),
  };
};

module.exports = { getHistoryDetails };
