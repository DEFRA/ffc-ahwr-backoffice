export const getCurrentStatusEvent = (application, historyRecords) => {
  const mostRecentStatusUpdate = historyRecords.findLast(
    ({ eventType }) => eventType === "status-updated",
  );

  const isToCurrentStatus =
    mostRecentStatusUpdate && mostRecentStatusUpdate.newValue === application.statusId;

  return isToCurrentStatus ? mostRecentStatusUpdate : null;
};
