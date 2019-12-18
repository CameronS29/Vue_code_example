import { sortedIndexBy, sortedLastIndexBy } from 'lodash';
import isWithinInterval from 'date-fns/isWithinInterval';
import addDays from 'date-fns/addDays';
import isValid from 'date-fns/isValid';

const MIN_DATE = new Date(0);
const MAX_DATE = new Date(2200, 0, 1);

export default {
  methods: {
    isDateDisabled: intervals => date => (
      intervals.reduce(
        (acc, interval) => (acc || isWithinInterval(date, interval)),
        false,
      )
    ),

    pickerStartDateDisabled(startDate, endDate, intervals) {
      const disabledIntervals = [...intervals];

      if (isValid(endDate)) {
        disabledIntervals.push({
          start: addDays(endDate, 1),
          end: MAX_DATE,
        });

        const lowerBoundIdx = sortedIndexBy(
          intervals,
          { start: endDate },
          ({ start }) => start.valueOf()
        );


        if (lowerBoundIdx > 0) {
          const { end } = intervals[lowerBoundIdx - 1];
          disabledIntervals.push({ start: MIN_DATE, end })
        }
      }

      return this.isDateDisabled(disabledIntervals);
    },

    pickerEndDateDisabled(startDate, endDate, intervals) {
      const disabledIntervals = [...intervals];

      if (isValid(startDate)) {
        disabledIntervals.push({ start: MIN_DATE, end: addDays(startDate, -1) });

        const upperBoundIdx = sortedLastIndexBy(
          intervals,
          { end: startDate },
          ({ end }) => end.valueOf(),
        );

        if (upperBoundIdx < intervals.length) {
          const { start } = intervals[upperBoundIdx];
          disabledIntervals.push({ start, end: MAX_DATE })
        }
      }

      return this.isDateDisabled(disabledIntervals);
    },
  },
};
