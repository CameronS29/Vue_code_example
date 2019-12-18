import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import compareAsc from 'date-fns/compareAsc';
import isValid from 'date-fns/isValid';
import toDate from 'date-fns/toDate';
import min from 'date-fns/min';
import max from 'date-fns/max';

import loadingMixin, { affectLoading } from 'store/helpers/loading';
import { DateTime } from 'luxon';
import reportsApi from 'api/reports';
import { toWeekDateRange } from 'utils/date';
import { compact, head, last, map, sortBy, toPairs, zip, zipObject } from 'lodash';

export const DEFAULT_RANGE = 0.25;
export const CURRENT_DATETIME = DateTime.utc();


export default loadingMixin({
  namespaced: true,

  state: {
    weekDateRange: toWeekDateRange(CURRENT_DATETIME),
    zone: 'utc',
    range: DEFAULT_RANGE,
    grid: [],
  },

  getters: {
    records: ({ grid }) => (
      map(grid, ({ title, data }) => {
        const pairLists = toPairs(data);
        const keys = map(pairLists, head);
        const values = map(pairLists, last);

        const propList = zip(...values);
        return {
          title,
          data: map(propList, prop => zipObject(keys, prop))
        };
      })
    ),

    flightPlacementMap: (state, { records }) => {
      return records.map((record) => {
        const levels = [[]];
        const sortedRecords = sortBy(record.data, flight => isValid(flight.datetime_out)
          ? min([flight.scheduled_departure, flight.datetime_out])
          : toDate(flight.scheduled_departure));

        for (const flight of sortedRecords) {
          const minDeparture = min([flight.scheduled_departure, flight.datetime_out]);
          let filled = false;

          for (let i = 0; (i < levels.length) && !filled; ++i) {
            const top = levels[i][levels[i].length - 1];
            if (top === undefined || compareAsc(max([top.scheduled_arrival, top.datetime_in]), minDeparture) === -1) {
              levels[i].push(flight);
              filled = true;
            }
          }

          if (!filled) {
            levels.push([flight]);
          }
        }

        return { ...record, levels };
      });
    },

    weekStartDate: ({ weekDateRange, zone }) => DateTime.fromISO(weekDateRange[0], { zone }),
    weekEndDate: ({ weekDateRange, zone }) => DateTime.fromISO(weekDateRange[1], { zone }).endOf('day'),
    weekDateRange: ({ weekDateRange: [startDate, endDate] }) => ([startOfWeek(startDate), endOfWeek(endDate)]),
    minuteOffset: (_, { weekStartDate }) => weekStartDate.offset,

    delay: ({ zone }, { records }) => {
      const dayDelayMap = {};
      records.forEach(row => {
        row.data.forEach(flight => {
          const delay = Math.max(flight.departure_delay / 60, 0) || 0;
          const offDate = DateTime.fromISO(flight.scheduled_departure).setZone(zone);
          const key = [row.title, offDate.toISO().slice(0, 10)].join('_');

          if (dayDelayMap[key]) {
            dayDelayMap[key] += delay;
          } else {
            dayDelayMap[key] = delay;
          }
        });
      });

      return dayDelayMap;
    },
  },

  actions: {
    @affectLoading
    async fetch({ commit, state, getters }, { groupBy } = {}) {
      const data = await reportsApi.getDelays({
        date_from: getters.weekStartDate.toISO(),
        date_to: getters.weekEndDate.toISO(),
        groupby: groupBy,
        full: true,
      });
      commit('setGrid', data);
    },
  },

  mutations: {
    setWeekDateRange(state, weekDateRange) {
      state.weekDateRange = weekDateRange;
    },
    setRange(state, range) {
      state.range = range;
    },
    setGrid(state, grid) {
      state.grid = grid;
    },
    setZone(state, zone) {
      state.zone = zone;
    },
  },
});
