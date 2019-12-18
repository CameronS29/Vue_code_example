import { DateTime } from 'luxon';

export function formatDate(date, tz = 'UTC') {
  return DateTime.fromISO(date, { setZone: true })
    .setZone(tz)
    .toLocaleString(DateTime.DATETIME_SHORT);
}
