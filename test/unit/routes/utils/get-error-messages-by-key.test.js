import { getErrorMessagesByKey } from "../../../../app/routes/utils/get-error-messages-by-key";

test("getErrorMessagesByKey rolls up date errors for visit date", () => {
  const errors = [
    { key: "day", text: "Day is required" },
    { key: "month", text: "Month is required" },
    { key: "year", text: "Year is required" },
  ];

  const result = getErrorMessagesByKey(errors);

  expect(result).toEqual({
    day: { text: "Day is required" },
    month: { text: "Month is required" },
    year: { text: "Year is required" },
    visitDate: { text: "Day is required, Month is required, Year is required" },
  });
});
