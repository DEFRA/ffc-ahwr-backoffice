import { getHolidayCalendarForEngland, isTodayCustomHoliday } from "./gov-holiday.js";

export async function isTodayHoliday() {
  const holidays = await getHolidayCalendarForEngland();
  const today = new Date().toISOString().split("T")[0]; // Format today's date as YYYY-MM-DD
  let isHoliday = holidays?.some((holiday) => holiday.date === today);

  if (!isHoliday) {
    isHoliday = await isTodayCustomHoliday();
  }

  return isHoliday;
}
