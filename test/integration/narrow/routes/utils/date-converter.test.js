const {
  convertDateToFormattedString,
} = require("../../../../../app/routes/utils/date-converter");

describe("convertDateToFormattedString", () => {
  it("should convert the date to the formatted string", () => {
    const date = new Date("2023-11-02");
    const formattedString = convertDateToFormattedString(date);
    expect(formattedString).toMatch("2 November 2023");
  });
});
