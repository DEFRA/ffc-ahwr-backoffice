const { getHistoryDetails } = require("../../../../../app/routes/models/application-history");

test("renders table", () => {
  const historyRecords = [
    {
      eventType: "status-updated",
      updatedProperty: "statusId",
      newValue: 12,
      note: "We should pay this",
      updatedBy: "Tester, A",
      updatedAt: "2025-03-11T15:07:08.488Z",
    },
    {
      eventType: "application-vetName",
      updatedProperty: "vetName",
      newValue: "Barry Newman",
      oldValue: "Barry Oldman",
      note: "A new Barry",
      updatedBy: "Testing, Bin",
      updatedAt: "2025-03-28T12:00:49.506Z",
    },
    {
      eventType: "application-vetRcvs",
      updatedProperty: "vetRcvs",
      newValue: "1234567",
      oldValue: "7654321",
      note: "Other way round",
      updatedBy: "Test, May",
      updatedAt: "2025-03-28T12:06:37.520Z",
    },
    {
      eventType: "application-visitDate",
      updatedProperty: "visitDate",
      newValue: "2025-03-02T00:00:00.000Z",
      oldValue: "2025-01-03T00:00:00.000Z",
      note: "Oops",
      updatedBy: "Tested, Bin",
      updatedAt: "2025-03-28T14:54:18.927Z",
    },
    {
      eventType: "Agreement flagged (non-Multiple Herds)",
      newValue: "Flagged (non-Multiple Herds)",
      note: "Flag this please",
      oldValue: "Unflagged",
      updatedAt: "2025-03-28T14:54:18.927Z",
      updatedBy: "Tom",
      updatedProperty: "agreementFlag",
    },
  ];

  const expected = {
    header: [
      { text: "Date" },
      { text: "Time" },
      { text: "Action" },
      { text: "User" },
      { text: "Note", classes: "govuk-!-width-one-quarter" },
    ],
    rows: [
      [
        { text: "11/03/2025" },
        { text: "15:07:08" },
        { text: "Recommended to Pay" },
        { text: "Tester, A" },
        { text: "We should pay this" },
      ],
      [
        { text: "28/03/2025" },
        { text: "12:00:49" },
        { text: "Vet updated from Barry Oldman to Barry Newman" },
        { text: "Testing, Bin" },
        { text: "A new Barry" },
      ],
      [
        { text: "28/03/2025" },
        { text: "12:06:37" },
        { text: "RCVS updated from 7654321 to 1234567" },
        { text: "Test, May" },
        { text: "Other way round" },
      ],
      [
        { text: "28/03/2025" },
        { text: "14:54:18" },
        { text: "Date of review updated from 03/01/2025 to 02/03/2025" },
        { text: "Tested, Bin" },
        { text: "Oops" },
      ],
      [
        { text: "28/03/2025" },
        { text: "14:54:18" },
        {
          text: "Agreement was moved from Unflagged to Flagged (non-Multiple Herds)",
        },
        { text: "Tom" },
        { text: "Flag this please" },
      ],
    ],
  };

  const historyData = getHistoryDetails(historyRecords);

  expect(historyData).toEqual(expected);
});
