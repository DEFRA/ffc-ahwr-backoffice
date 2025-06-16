import { regexChecker } from "../../../../app/routes/utils/regex-checker";

describe("regexChecker", () => {
  test("should return false if the string is empty", () => {
    const regex = /^IAHW-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
    const str = "";
    const result = regexChecker(regex, str);
    expect(result).toBe(false);
  });
  test("should return true if the string matches the regex", () => {
    const regex = /^IAHW-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
    const str = "IAHW-1234-5678";
    const result = regexChecker(regex, str);
    expect(result).toBe(true);
  });

  test("should return false if the string does not match the regex", () => {
    const regex = /^AHWR-[\da-f]{4}-[\da-f]{4}$/i;
    const str = "AHWR-1234-APP1";
    const result = regexChecker(regex, str);
    expect(result).toBe(false);
  });

  test("should handle invalid regex and return false", () => {
    const regex = "[";
    const str = "12345";
    const result = regexChecker(regex, str);
    expect(result).toBe(false);
  });
});
