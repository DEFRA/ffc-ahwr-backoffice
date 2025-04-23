const { getAllFlags } = require("../../api/flags");
const { serviceUri } = require("../../config");

const formatDate = (dateInput) => {
  const date = new Date(dateInput); // parses with timezone offset preserved

  return date.toLocaleString("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const createFlagsTableData = async (logger, flagIdToDelete, createFlag) => {
  const flags = await getAllFlags(logger);
  const header = [
    {
      text: "Agreement number",
    },
    {
      text: "SBI",
    },
    {
      text: "Note",
    },
    {
      text: "Created by",
    },
    {
      text: "Created at",
    },
    {
      text: "Flagged due to multiple herds",
    },
    {
      text: "",
    },
  ];

  const rows = flags.map((flag) => {
    return [
      {
        text: flag.applicationReference,
      },
      {
        text: flag.sbi,
      },
      {
        text: flag.note,
      },
      {
        text: flag.createdBy,
      },
      {
        text: formatDate(flag.createdAt),
      },
      {
        text: flag.appliesToMh === true ? "Yes" : "No",
      },
      {
        html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=${flag.id}">Delete flag</a>`,
      },
    ];
  });

  const applicationRefOfFlagToDelete = flagIdToDelete
    ? flags.find((flag) => flag.id === flagIdToDelete).applicationReference
    : undefined;
  const flagIsForMh = flagIdToDelete
    ? flags.find((flag) => flag.id === flagIdToDelete).appliesToMh
    : undefined;
  const appliesToMh = flagIsForMh ? "multiple herds T&C's" : "non-MH";

  return {
    model: {
      header,
      rows,
      flagIdToDelete,
      applicationRefOfFlagToDelete,
      appliesToMh,
      createFlagUrl: `${serviceUri}/flags?createFlag=true`,
      createFlag,
    },
  };
};

module.exports = { createFlagsTableData };
