import {
  getHolidayCalendarForEngland,
  isTodayCustomHoliday,
} from "../../../app/api/gov-holiday.js";
import { isTodayHoliday } from "../../../app/api/is-today-holiday.js";

jest.mock("../../../app/api/gov-holiday.js", () => ({
  getHolidayCalendarForEngland: jest.fn(),
  isTodayCustomHoliday: jest.fn(),
}));

// Mock today's date and the API response
const today = new Date().toISOString().split("T")[0];
const mockEvents = [{ date: today, title: "Mock Holiday" }];
getHolidayCalendarForEngland.mockResolvedValue(mockEvents);
isTodayCustomHoliday.mockResolvedValue(false);

describe("isTodayHoliday", () => {
  it("should return true if today is a holiday", async () => {
    expect(await isTodayHoliday()).toBeTruthy();
    expect(getHolidayCalendarForEngland).toHaveBeenCalled();
    expect(isTodayCustomHoliday).not.toHaveBeenCalled();
  });

  it("should return false if today is not a holiday", async () => {
    // Mock today's date and the API response
    const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const mockEvents = [{ date: tomorrow, title: "Mock Holiday" }];
    getHolidayCalendarForEngland.mockResolvedValue(mockEvents);
    isTodayCustomHoliday.mockResolvedValue(false);

    expect(await isTodayHoliday()).toBeFalsy();
    expect(getHolidayCalendarForEngland).toHaveBeenCalled();
    expect(isTodayCustomHoliday).toHaveBeenCalled();
  });

  it("when Events NULL should return false if today is not a holiday", async () => {
    const mockEvents = null;
    getHolidayCalendarForEngland.mockResolvedValue(mockEvents);
    isTodayCustomHoliday.mockResolvedValue(false);

    expect(await isTodayHoliday()).toBeFalsy();
    expect(getHolidayCalendarForEngland).toHaveBeenCalled();
    expect(isTodayCustomHoliday).toHaveBeenCalled();
  });
});
