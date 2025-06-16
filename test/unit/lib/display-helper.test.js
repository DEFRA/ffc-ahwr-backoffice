import {
  upperFirstLetter,
  formattedDateToUk,
  formatSpecies,
  formatTypeOfVisit,
  formatStatusId,
} from "../../../app/lib/display-helper";

describe("display-helper tests", () => {
  test.each([
    { input: "", expected: "" },
    { input: undefined, expected: "" },
    { input: "test", expected: "Test" },
    { input: "123", expected: "123" },
  ])("upperFirstLetter with $input", async ({ input, expected }) => {
    expect(upperFirstLetter(input)).toEqual(expected);
  });

  test.each([
    { input: "2024-12-15", expected: "15/12/2024" },
    { input: "1-1-2024", expected: "01/01/2024" },
  ])("formattedDateToUk with $input", async ({ input, expected }) => {
    expect(formattedDateToUk(input)).toEqual(expected);
  });

  test.each([
    { input: "beef", expected: "Beef cattle" },
    { input: "dairy", expected: "Dairy cattle" },
    { input: "sheep", expected: "Sheep" },
    { input: "pigs", expected: "Pigs" },
    { input: "other", expected: undefined },
    { input: undefined, expected: undefined },
  ])("formatSpecies with $input", async ({ input, expected }) => {
    expect(formatSpecies(input)).toEqual(expected);
  });

  test.each([
    { input: "E", expected: "Endemics" },
    { input: "R", expected: "Review" },
    { input: undefined, expected: undefined },
  ])("formatTypeOfVisit with $input", async ({ input, expected }) => {
    expect(formatTypeOfVisit(input)).toEqual(expected);
  });

  test.each([
    { input: 1, expected: "AGREED" },
    { input: 2, expected: "WITHDRAWN" },
    { input: 5, expected: "IN CHECK" },
    { input: 6, expected: "ACCEPTED" },
    { input: 7, expected: "NOT AGREED" },
    { input: 8, expected: "PAID" },
    { input: 9, expected: "READY TO PAY" },
    { input: 10, expected: "REJECTED" },
    { input: 11, expected: "ON HOLD" },
    { input: 12, expected: "RECOMMENDED TO PAY" },
    { input: 13, expected: "RECOMMENDED TO REJECT" },
    { input: 14, expected: "AUTHORISED" },
    { input: 15, expected: "SENT TO FINANCE" },
    { input: 16, expected: "PAYMENT HELD" },
    { input: undefined, expected: undefined },
  ])("formatStatusId with $input", async ({ input, expected }) => {
    expect(formatStatusId(input)).toEqual(expected);
  });
});
