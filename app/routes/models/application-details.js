const {
  formattedDateToUk,
  upperFirstLetter,
} = require("../../lib/display-helper");
const { getStyleClassByStatus } = require("../../constants/status");
const speciesNumbers = require("../../constants/species-numbers");

const getApplicationDetails = (application, statusActions) => {
  const { data, createdAt, status } = application;
  const formatedDate = formattedDateToUk(createdAt);

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
      key: {
        text:
          status.status === "NOT AGREED"
            ? "Date agreement rejected"
            : "Date of agreement",
      },
      value: { text: formatedDate },
    },
    {
      key: { text: "Business details correct" },
      value: { text: upperFirstLetter(data.confirmCheckDetails) },
    },
    {
      key: { text: "Type of review" },
      value: { text: upperFirstLetter(data.whichReview) },
    },
    {
      key: { text: "Number of livestock" },
      value: { text: speciesNumbers[data.whichReview] },
    },
    {
      key: { text: "Agreement accepted" },
      value: { text: data.offerStatus === "accepted" ? "Yes" : "No" },
    },
  ];
};

module.exports = { getApplicationDetails };
