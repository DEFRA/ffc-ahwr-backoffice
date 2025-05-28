const {
  formattedDateToUk,
  upperFirstLetter,
} = require("../../lib/display-helper");
const { getStyleClassByStatus } = require("../../constants/status");
const { parseData } = require("../utils/parse-data");

const claimDataStatus = [
  "IN CHECK",
  "REJECTED",
  "READY TO PAY",
  "ON HOLD",
  "Recommended to Pay",
  "Recommended to Reject",
];

const getApplicationClaimDetails = (
  application,
  applicationEvents,
  statusActions,
  visitDateActions,
  vetsNameActions,
  vetRCVSNumberActions,
) => {
  if (
    !application.claimed &&
    !claimDataStatus.includes(application.status.status)
  ) {
    return null;
  }

  const { data, status } = application;
  let formatedDate = "";

  if (data?.dateOfClaim) {
    formatedDate = formattedDateToUk(data?.dateOfClaim);
  } else {
    let filteredEvents;
    if (applicationEvents?.eventRecords) {
      filteredEvents = applicationEvents.eventRecords.filter(
        (event) => event.EventType === "claim-claimed",
      );
      if (filteredEvents.length !== 0) {
        const claimClaimed = parseData(
          filteredEvents,
          "claim-claimed",
          "claimed",
        );
        formatedDate = formattedDateToUk(claimClaimed?.raisedOn);
      }
    }
  }

  const statusLabel = upperFirstLetter(status.status.toLowerCase());
  const statusClass = getStyleClassByStatus(status.status);

  return [
    {
      key: { text: "Status" },
      value: {
        html: `<span class="govuk-tag app-long-tag ${statusClass}">${statusLabel}</span>`,
      },
      actions: statusActions,
    },
    {
      key: { text: "Date of review" },
      value: { text: formattedDateToUk(data.visitDate) },
      actions: visitDateActions,
    },
    {
      key: { text: "Date of testing" },
      value: { text: formattedDateToUk(data.dateOfTesting) },
    },
    { key: { text: "Date of claim" }, value: { text: formatedDate } },
    {
      key: { text: "Review details confirmed" },
      value: { text: upperFirstLetter(data.confirmCheckDetails) },
    },
    {
      key: { text: "Vet’s name" },
      value: { text: data.vetName },
      actions: vetsNameActions,
    },
    {
      key: { text: "Vet’s RCVS number" },
      value: { text: data.vetRcvs },
      actions: vetRCVSNumberActions,
    },
    {
      key: { text: "Test results unique reference number (URN)" },
      value: { text: data.urnResult },
    },
  ];
};

module.exports = { getApplicationClaimDetails };
