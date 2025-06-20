import { getHolidayCalendarForEngland, isTodayCustomHoliday } from "../../../app/api/gov-holiday";
import Wreck from "@hapi/wreck";

describe("Holiday Functions", () => {
  describe("getHolidayCalendarForEngland", () => {
    let wreckGetSpy;

    beforeEach(() => {
      wreckGetSpy = jest.spyOn(Wreck, "get");
    });

    afterEach(() => {
      wreckGetSpy.mockRestore();
    });

    it("should fetch the holiday calendar and return the events", async () => {
      // Mock the API response
      const mockEvents = [{ date: "2024-01-01", title: "New Year’s Day" }];
      wreckGetSpy.mockResolvedValue({
        payload: {
          "england-and-wales": {
            events: mockEvents,
          },
        },
      });

      expect(await getHolidayCalendarForEngland()).toEqual(mockEvents);
      expect(wreckGetSpy).toHaveBeenCalledWith("https://www.gov.uk/bank-holidays.json", {
        json: true,
      });
    });

    it("should throw errors", async () => {
      wreckGetSpy.mockRejectedValueOnce("holiday boom");

      expect(async () => {
        await getHolidayCalendarForEngland();
      }).rejects.toBe("holiday boom");
    });

    it("throws if payload is missing events", async () => {
      wreckGetSpy.mockResolvedValue({
        payload: [],
      });

      expect(async () => {
        await getHolidayCalendarForEngland();
      }).rejects.toThrow("bank holidays response missing events");
    });
  });

  describe("isTodayCustomHoliday", () => {
    let wreckGetSpy;

    beforeEach(() => {
      wreckGetSpy = jest.spyOn(Wreck, "get");
    });

    afterEach(() => {
      wreckGetSpy.mockRestore();
    });

    it("should return true when 200 response", async () => {
      wreckGetSpy.mockResolvedValue({
        payload: null,
      });

      expect(await isTodayCustomHoliday()).toBeTruthy();
    });

    it("should return false when response is 404", async () => {
      wreckGetSpy.mockRejectedValueOnce({
        output: { statusCode: 404 },
      });

      expect(await isTodayCustomHoliday()).toBe(false);
    });

    it("should return throw errors", async () => {
      const errorResponse = {
        output: { statusCode: 500 },
      };

      wreckGetSpy.mockRejectedValueOnce(errorResponse);

      expect(async () => {
        await isTodayCustomHoliday();
      }).rejects.toBe(errorResponse);
    });
  });
});
