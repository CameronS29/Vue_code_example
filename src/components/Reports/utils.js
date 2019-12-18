import compose from 'lodash/fp/compose';
import padStart from 'lodash/padStart';
import { DateTime } from 'luxon';


const processTimeArray = compose(
  n => padStart(n, 2, '0'),
  Math.trunc,
  Math.abs,
);

export function formatTime(value) {
  const duration = Number(value);
  const days = Math.trunc(duration / 86400);

  const time = [
    (duration / 3600) % 24,
    (duration / 60) % 60,
    (duration % 60),
  ].map(processTimeArray).join(':');

  return (days >= 1
    ? `${days}d ${time}`
    : `${duration < 0 ? '-' : ''}${time}`);
}

export function formatDateTime(dateStr, tzOffset = 'utc') {
  const dt = DateTime.fromISO(dateStr, { zone: tzOffset });
  return dt.isValid ? dt.toLocaleString(DateTime.DATETIME_SHORT) : '';
}


export const timeZones = [
  { name: 'UTC', offset: 'utc' },
  { name: 'EST', offset: 'utc-5' },
  { name: 'EDT', offset: 'utc-4' },
  { name: 'CST', offset: 'utc-6' },
  { name: 'CDT', offset: 'utc-5' },
  { name: 'MST', offset: 'utc-7' },
  { name: 'MDT', offset: 'utc-6' },
  { name: 'PST', offset: 'utc-8' },
  { name: 'PDT', offset: 'utc-7' },
];

export function percent(value) {
  return `${(value * 100).toFixed(2)}%`;
}
