const {
  formatedDateToUk,
  upperFirstLetter,
} = require("../../lib/display-helper");
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
  statusRow,
) => {
  if (
    !application.claimed &&
    !claimDataStatus.includes(application.status.status)
  ) {
    return null;
  }

  const { data } = application;
  let formatedDate = "";

  if (data?.dateOfClaim) {
    formatedDate = formatedDateToUk(data?.dateOfClaim);
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
        formatedDate = formatedDateToUk(claimClaimed?.raisedOn);
      }
    }
  }

  return [
    statusRow,
    {
      key: { text: "Date of review" },
      value: { text: formatedDateToUk(data.visitDate) },
    },
    {
      key: { text: "Date of testing" },
      value: { text: formatedDateToUk(data.dateOfTesting) },
    },
    { key: { text: "Date of claim" }, value: { text: formatedDate } },
    {
      key: { text: "Review details confirmed" },
      value: { text: upperFirstLetter(data.confirmCheckDetails) },
    },
    { key: { text: "Vet’s name" }, value: { text: data.vetName } },
    { key: { text: "Vet’s RCVS number" }, value: { text: data.vetRcvs } },
    {
      key: { text: "Test results unique reference number (URN)" },
      value: { text: data.urnResult },
    },
  ];
};

module.exports = { getApplicationClaimDetails };
