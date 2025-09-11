import { getAllFlags } from "../../api/flags.js";
import { config } from "../../config/index.js";

const { serviceUri } = config;

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

const createRows = (flags, isAdmin) => {
  return flags.map((flag) => {
    const isAgreementNotRedacted = !flag.applicationRedacts?.length
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
      ...(isAdmin && isAgreementNotRedacted
        ? [
          {
            html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=${flag.id}">Delete flag</a>`,
          },
        ]
        : [{ html: '</>' }]),
    ].filter((item) => Object.keys(item).length > 0);
  });
};

const createTableHeader = (isAdmin) => {
  return [
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
    ...(isAdmin
      ? [
        {
          text: "Action",
        },
      ]
      : [{}]),
  ].filter((item) => Object.keys(item).length > 0);
};

export const createFlagsTableData = async ({ logger, flagIdToDelete, createFlag, isAdmin }) => {
  const flags = await getAllFlags(logger);

  const applicationRefOfFlagToDelete = flagIdToDelete
    ? flags.find((flag) => flag.id === flagIdToDelete).applicationReference
    : undefined;
  const flagIsForMh = flagIdToDelete
    ? flags.find((flag) => flag.id === flagIdToDelete).appliesToMh
    : undefined;
  const appliesToMh = flagIsForMh ? "multiple herds T&C's" : "non-MH";

  return {
    model: {
      header: createTableHeader(isAdmin),
      rows: createRows(flags, isAdmin),
      flagIdToDelete,
      applicationRefOfFlagToDelete,
      appliesToMh,
      createFlagUrl: `${serviceUri}/flags?createFlag=true`,
      createFlag,
    },
  };
};
