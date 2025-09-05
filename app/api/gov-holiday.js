import wreck from "@hapi/wreck";
import { config } from "../config/index.js";
import { StatusCodes } from "http-status-codes";

const { applicationApiUri } = config;

export async function getHolidayCalendarForEngland() {
  const endpoint = "https://www.gov.uk/bank-holidays.json";
  const { payload } = await wreck.get(endpoint, { json: true });
  if (!payload?.["england-and-wales"]?.events) {
    throw new Error("bank holidays response missing events");
  }
  return payload["england-and-wales"].events; // Returns only the events for England and Wales
}

export async function isTodayCustomHoliday() {
  const url = `${applicationApiUri}/holidays/isTodayHoliday`;
  try {
    await wreck.get(url);
    return true;
  } catch (err) {
    if (err.output.statusCode === StatusCodes.NOT_FOUND) {
      // Switch this to a 204 in another ticket
      return false;
    } else {
      throw err;
    }
  }
}
