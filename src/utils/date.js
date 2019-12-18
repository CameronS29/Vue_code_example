// @flow
import { DateTime } from 'luxon';

export function toRepr(date) {
  return DateTime.fromJSDate(date)
    .setZone('utc', { keepLocalTime: true })
    .toISO({ suppressMilliseconds: true });
}

export function fromRepr(dateStr) {
  return DateTime.fromISO(dateStr, { setZone: true })
    .setZone('local', { keepLocalTime: true })
    .toJSDate();
}

export function nullPad(digit, fromStart = 2) {
  return digit.toString()
    .padStart(fromStart, '0');
}

export const hoursToTimeSimple = hours => [
  nullPad(parseInt(hours)),
  nullPad(Math.abs(((hours % 1).toFixed(4) * 60))),
].join(':');

export const toWeekDateRange = dateTime => [
  dateTime.startOf('week')
    .minus({ days: 1 })
    .toISODate(),
  dateTime.endOf('week')
    .minus({ days: 1 })
    .toISODate(),
];

export const toUSWeekDateRange = dateTime => [
  dateTime.startOf('week')
    .minus({ days: 1 })
    .toLocaleString(DateTime.DATE_SHORT),
  dateTime.endOf('week')
    .minus({ days: 1 })
    .toLocaleString(DateTime.DATE_SHORT),
];

export const rangeToDatesArray = (range) => {
  const result = [];
  const start = range[0];
  const end = range[1];

  const dayDiff = parseInt(end.diff(start, 'days').days);

  for (let i = 0; i <= dayDiff; i++) {
    result.push(start.plus({ days: i })
      .toISODate());
  }

  return result;
};

export const isSameDate = (date1, date2) => {
  return date1.hasSame(date2, 'year') && date1.hasSame(date2, 'month') && date1.hasSame(date2, 'day');
};
