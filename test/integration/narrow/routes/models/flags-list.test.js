const flags = require("../../../../../app/api/flags");
const { createFlagsTableData } = require("../../../../../app/routes/models/flags-list");
const mockFlags = require("../../../../data/flags.json");
const { serviceUri } = require("../../../../../app/config");

jest.mock("../../../../../app/api/flags");

flags.getAllFlags.mockResolvedValue(mockFlags);

const mockLogger = {
  setBindings: jest.fn(),
};

describe("createFlagsTableData", () => {
  it("creates the table data from the getAllFlags API call data", async () => {
    const result = await createFlagsTableData({
      logger: mockLogger,
      isAdmin: true,
    });

    expect(result).toEqual({
      model: {
        applicationRefOfFlagToDelete: undefined,
        appliesToMh: "non-MH",
        createFlag: undefined,
        createFlagUrl: `${serviceUri}/flags?createFlag=true`,
        flagIdToDelete: undefined,
        header: [
          { text: "Agreement number" },
          { text: "SBI" },
          { text: "Note" },
          { text: "Created by" },
          { text: "Created at" },
          { text: "Flagged due to multiple herds" },
          { text: "Action" },
        ],
        rows: [
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Tom" },
            { text: "Invalid Date" },
            { text: "No" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=333c18ef-fb26-4beb-ac87-c483fc886fea">Delete flag</a>`,
            },
          ],
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Ben" },
            { text: "Invalid Date" },
            { text: "Yes" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=53dbbc6c-dd14-4d01-be11-ad288cb16b08">Delete flag</a>`,
            },
          ],
        ],
      },
    });
  });

  it("creates the table data from the getAllFlags API call data when create flag is true", async () => {
    const result = await createFlagsTableData({
      logger: mockLogger,
      flagIdToDelete: undefined,
      createFlag: true,
      isAdmin: true,
    });

    expect(result).toEqual({
      model: {
        applicationRefOfFlagToDelete: undefined,
        appliesToMh: "non-MH",
        createFlag: true,
        createFlagUrl: `${serviceUri}/flags?createFlag=true`,
        flagIdToDelete: undefined,
        header: [
          { text: "Agreement number" },
          { text: "SBI" },
          { text: "Note" },
          { text: "Created by" },
          { text: "Created at" },
          { text: "Flagged due to multiple herds" },
          { text: "Action" },
        ],
        rows: [
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Tom" },
            { text: "Invalid Date" },
            { text: "No" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=333c18ef-fb26-4beb-ac87-c483fc886fea">Delete flag</a>`,
            },
          ],
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Ben" },
            { text: "Invalid Date" },
            { text: "Yes" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=53dbbc6c-dd14-4d01-be11-ad288cb16b08">Delete flag</a>`,
            },
          ],
        ],
      },
    });
  });

  it("creates the table data from the getAllFlags API call data when create flag is true, but user is not an admin", async () => {
    const result = await createFlagsTableData({
      logger: mockLogger,
      flagIdToDelete: undefined,
      createFlag: true,
      isAdmin: false,
    });

    expect(result).toEqual({
      model: {
        applicationRefOfFlagToDelete: undefined,
        appliesToMh: "non-MH",
        createFlag: true,
        createFlagUrl: `${serviceUri}/flags?createFlag=true`,
        flagIdToDelete: undefined,
        header: [
          { text: "Agreement number" },
          { text: "SBI" },
          { text: "Note" },
          { text: "Created by" },
          { text: "Created at" },
          { text: "Flagged due to multiple herds" },
        ],
        rows: [
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Tom" },
            { text: "Invalid Date" },
            { text: "No" },
          ],
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Ben" },
            { text: "Invalid Date" },
            { text: "Yes" },
          ],
        ],
      },
    });
  });

  it("creates the table data from the getAllFlags API call data when a flagId to delete is passed", async () => {
    const result = await createFlagsTableData({
      logger: mockLogger,
      flagIdToDelete: mockFlags[0].id,
      createFlag: false,
      isAdmin: true,
    });

    expect(result).toEqual({
      model: {
        applicationRefOfFlagToDelete: mockFlags[0].applicationReference,
        appliesToMh: "non-MH",
        createFlag: false,
        createFlagUrl: `${serviceUri}/flags?createFlag=true`,
        flagIdToDelete: mockFlags[0].id,
        header: [
          { text: "Agreement number" },
          { text: "SBI" },
          { text: "Note" },
          { text: "Created by" },
          { text: "Created at" },
          { text: "Flagged due to multiple herds" },
          { text: "Action" },
        ],
        rows: [
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Tom" },
            { text: "Invalid Date" },
            { text: "No" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=333c18ef-fb26-4beb-ac87-c483fc886fea">Delete flag</a>`,
            },
          ],
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Ben" },
            { text: "Invalid Date" },
            { text: "Yes" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=53dbbc6c-dd14-4d01-be11-ad288cb16b08">Delete flag</a>`,
            },
          ],
        ],
      },
    });
  });

  it("creates the table data from the getAllFlags API call data when a flagId to delete is passed and it is a flag which applies to multiple herds", async () => {
    const result = await createFlagsTableData({
      logger: mockLogger,
      flagIdToDelete: mockFlags[1].id,
      createFlag: false,
      isAdmin: true,
    });

    expect(result).toEqual({
      model: {
        applicationRefOfFlagToDelete: mockFlags[1].applicationReference,
        appliesToMh: "multiple herds T&C's",
        createFlag: false,
        createFlagUrl: `${serviceUri}/flags?createFlag=true`,
        flagIdToDelete: mockFlags[1].id,
        header: [
          { text: "Agreement number" },
          { text: "SBI" },
          { text: "Note" },
          { text: "Created by" },
          { text: "Created at" },
          { text: "Flagged due to multiple herds" },
          { text: "Action" },
        ],
        rows: [
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Tom" },
            { text: "Invalid Date" },
            { text: "No" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=333c18ef-fb26-4beb-ac87-c483fc886fea">Delete flag</a>`,
            },
          ],
          [
            { text: "IAHW-U6ZE-5R5E" },
            { text: "123456789" },
            { text: "Flag this please" },
            { text: "Ben" },
            { text: "Invalid Date" },
            { text: "Yes" },
            {
              html: `<a class="govuk-button govuk-button--warning" data-module="govuk-button" href="${serviceUri}/flags?deleteFlag=53dbbc6c-dd14-4d01-be11-ad288cb16b08">Delete flag</a>`,
            },
          ],
        ],
      },
    });
  });
});
