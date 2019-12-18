import { DateTime } from 'luxon';
import { range, fromPairs, map, zip, get, forEach, isUndefined, sortBy } from 'lodash';

export function generateDayMap(blocks, date) {
  const sortedBlocks = sortBy(blocks, block => DateTime.fromISO(block.datetime_off).valueOf());

  const blockDays = map(sortedBlocks, (block) => {
    const on = DateTime.fromISO(block.datetime_on).setZone(date.zoneName);
    const off = DateTime.fromISO(block.datetime_off).setZone(date.zoneName);

    if (on.month !== date.month && off.month !== date.month) return undefined;

    const minDay = (on.month === date.month ? on.day : 1);
    const maxDay = (off.month === date.month ? off.day : date.daysInMonth);

    return [block, range(minDay, maxDay + 1)];
  }).filter(blockDay => !isUndefined(blockDay));

  const daysMap = fromPairs(map(range(1, 32), n => ([n, []])));
  forEach(blockDays, ([block, days]) =>
    forEach(days, (day) => daysMap[day].push(block)));

  return daysMap;
}
