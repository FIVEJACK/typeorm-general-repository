import { addDays, format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

const timeZone = process.env.TZ;

export const addDayForCurrentTime = (days: number) => {
  const dateString = addDays(prepareDate(new Date()), days);
  return dateString;
};

export function prepareDate(dateString: any) {
  let utcTime = zonedTimeToUtc(dateString, timeZone);
  return utcTime;
}

export function isCurrentDateWeekend() {
  const currentDate = new Date();
  const day = currentDate.getDay();
  if (day == 0 || day == 6) {
    // 0 = sunday 6 = saturday
    return true;
  }

  return false;
}

export function getCurrentHour() {
  const currentDate = new Date();
  const hour = currentDate.getHours();
  return hour;
}

export function getDateFormatForWithdrawCode(createdAt: string) {
  const result = format(prepareDate(createdAt), 'yyMMdd');
  return result;
}
