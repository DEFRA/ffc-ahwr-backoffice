const {
  getClaimTableHeader,
  getClaimTableRows,
} = require("../../../../../app/routes/models/claim-list");
const { setEndemicsEnabled } = require("../../../../mocks/config");

describe("Application-list model test", () => {
  describe("endemics enable true", () => {
    beforeEach(() => {
      setEndemicsEnabled(true);
    });
    test.each([
      { n: 0, field: "claim number", direction: "DESC" },
      { n: 0, field: "claim number", direction: "ASC" },
      { n: 1, field: "type of visit", direction: "DESC" },
      { n: 1, field: "type of visit", direction: "ASC" },
      { n: 2, field: "SBI", direction: "DESC" },
      { n: 2, field: "SBI", direction: "ASC" },
      { n: 3, field: "species", direction: "DESC" },
      { n: 3, field: "species", direction: "ASC" },
      { n: 4, field: "claim date", direction: "DESC" },
      { n: 4, field: "claim date", direction: "ASC" },
      { n: 5, field: "status", direction: "DESC" },
      { n: 5, field: "status", direction: "ASC" },
    ])(
      "getClaimTableHeader $field $direction",
      async ({ n, field, direction }) => {
        const sortField = { field, direction };
        const ariaSort = direction === "DESC" ? "descending" : "ascending";
        const res = getClaimTableHeader(sortField);
        expect(res).not.toBeNull();
        expect(res[n].attributes["aria-sort"]).toEqual(ariaSort);
      },
    );
  });
});

describe("Application-list createModel", () => {
  const claims = [
    {
      id: "32ccceb1-038f-4c6b-8ed0-af0cf70af831",
      reference: "AHWR-1111-1111",
      applicationReference: "AHWR-1234-APP1",
      data: {
        vetsName: "asdasd",
        dateOfVisit: "2024-03-22T00:00:00.000Z",
        dateOfTesting: "2024-03-22T00:00:00.000Z",
        laboratoryURN: "123123",
        vetRCVSNumber: "1235671",
        speciesNumbers: "yes",
        typeOfLivestock: "sheep",
        numberAnimalsTested: "123",
      },
      statusId: 8,
      type: "R",
      createdAt: "2024-03-22T12:20:18.307Z",
      updatedAt: "2024-03-22T12:20:18.307Z",
      createdBy: "sql query",
      updatedBy: null,
      status: {
        status: "PAID",
      },
      application: {
        data: {
          organisation: {
            sbi: 123456,
          },
        },
      },
    },
  ];

  beforeAll(() => {
    setEndemicsEnabled(true);
  });

  test("getClaimTableRows", async () => {
    const page = 1;
    const returnPage = "claim";
    const rows = getClaimTableRows(claims, page, returnPage);

    expect(rows[0][0].text).toBe("AHWR-1111-1111");
  });
  test("getClaimTableRows showSBI false", async () => {
    const page = 1;
    const returnPage = "claim";
    const showSBI = false;
    const rows = getClaimTableRows(claims, page, returnPage, showSBI);

    expect(rows[0][0].text).toBe("AHWR-1111-1111");
  });
});
