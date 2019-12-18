import { find, filter, keyBy, zipObject } from 'lodash';
import { DateTime } from 'luxon';

import {
  LUXON_US_DATE_FORMAT,
  SET_ACTIVE_PILOT,
  SET_ACTIVE_DATE,
  SET_ACTIVE_DATE_RANGE,
  SET_ACTIVE_COORDINATES,
  SIC_RANK_ID, SET_HOVERED_DATE,
  SET_ACTIVE_RECORDS,
  SET_LINKED_PAIRS,
  CHANGE_LINKAGE_STATE,
  ON_DAY_LINK,
  NEXT_DAY_LINK,
} from 'store/modules/scheduling/consts';
import api from 'api/scheduling';

import { rangeToDatesArray } from 'utils/date';
import { activeRevisionPath } from './index';


export default {
  namespaced: true,

  state: {
    pilotId: null,
    date: null,
    dateRange: [null, null],
    hoveredDate: null,
    coordinates: {
      x: 0,
      y: 0,
    },
    detailedRecords: [],
    linkedPairs: [],
    linkageMap: {},
  },

  getters: {
    activePilot: (state, _, { scheduling }) => find(
      scheduling.calendar.pilotGrid.pilots,
      { pilot: { id: state.pilotId } },
    ),
    isActivePilotSIC: (state, { activePilot }) => activePilot && (activePilot.pilot.rank === SIC_RANK_ID),

    activeRecords: ({ date }, { activePilot }) => (activePilot !== undefined
      ? filter(activePilot.schedule_records, (record) => {
        if (record.date) return record.date === date;
        if (record.duty_on) return DateTime.fromISO(record.duty_on).toFormat(LUXON_US_DATE_FORMAT) === date;
        return undefined;
      }) : []
    ),

    isPairBindingVisible: (state, { isDateRangeSelected }) => (
      state.pilotId !== null
      && ((state.date !== null) || isDateRangeSelected)),
    isDateRangeSelected: state => state.dateRange.filter(date => date).length === 2,
    isPending: state => state.progress > 0,
    coordinates: state => state.coordinates,
    date: state => state.date,
    dateTime: state => (
      state.date !== null
        ? DateTime.fromFormat(state.date, LUXON_US_DATE_FORMAT, { zone: 'utc' })
        : DateTime.utc()
    ),
    dateRange: state => state.dateRange,
    dateRangeDates: (state) => {
      if (!state.dateRange[0] || !state.dateRange[1]) return undefined;
      const sortedRange = state.dateRange
        .map(date => (date !== null
          ? DateTime.fromFormat(date, LUXON_US_DATE_FORMAT, { zone: 'utc' })
          : DateTime.utc()))
        .sort();

      return rangeToDatesArray(sortedRange);
    },
    isShown: (state) => {
      if (!state.pilotId) return false;

      return state.date || (state.dateRange[0] && state.dateRange[1]);
    },
    linkedPairsMap: state => keyBy(state.linkedPairs, 'pair'),
    selectedLinkedPair: (state, getters) => (pair) => {
      const selected = state.linkageMap[pair.id];
      const pairDate = DateTime.fromFormat(pair.date, LUXON_US_DATE_FORMAT);

      switch (selected) {
        case ON_DAY_LINK:
          return {
            ...getters.linkedPairsMap[pair.id].on_day,
            date: pair.date,
          };
        case NEXT_DAY_LINK:
          return {
            ...getters.linkedPairsMap[pair.id].next_day,
            date: pairDate.plus({ days: 1 }).toFormat(LUXON_US_DATE_FORMAT),
          };
        default:
          return null;
      }
    },
  },

  actions: {
    closePairBinding({ commit }) {
      commit(SET_ACTIVE_PILOT, null);
      commit(SET_ACTIVE_DATE, null);
      commit(SET_ACTIVE_DATE_RANGE, [null, null]);
      commit(SET_ACTIVE_COORDINATES, { x: 0, y: 0 });
    },

    showPairBinding({ commit }, { pilotId, date, coordinates }) {
      commit(SET_ACTIVE_COORDINATES, coordinates);
      commit(SET_ACTIVE_PILOT, pilotId);
      commit(SET_ACTIVE_DATE_RANGE, [null, null]);
      commit(SET_ACTIVE_DATE, date);
    },

    startRangePairBinding({ commit }, { pilotId, date }) {
      commit(SET_ACTIVE_PILOT, pilotId);
      commit(SET_ACTIVE_DATE, null);
      commit(SET_ACTIVE_DATE_RANGE, [date, null]);
    },

    endRangePairBinding({ commit, state }, { date, coordinates }) {
      const dates = [state.dateRange[0], date];

      commit(SET_ACTIVE_COORDINATES, coordinates);
      commit(SET_ACTIVE_DATE_RANGE, dates);
    },

    async fetchDetailedRecords({ commit, state, rootGetters }) {
      const { date, pilotId: pilot } = state;
      const revision = rootGetters[activeRevisionPath].id;
      const records = await api.getRecords({
        date,
        pilot,
        revision,
      });

      commit(SET_ACTIVE_RECORDS, records);
    },

    async fetchLinked({ commit }, filters) {
      const linkedPairs = await api.getLinkedPairs(filters);
      commit(SET_LINKED_PAIRS, linkedPairs);
    },
  },

  mutations: {
    [SET_ACTIVE_PILOT](state, pilotId) {
      state.pilotId = pilotId;
    },

    [SET_ACTIVE_DATE](state, date) {
      state.date = date;
    },

    [SET_ACTIVE_DATE_RANGE](state, range) {
      state.dateRange = range;
    },

    [SET_ACTIVE_COORDINATES](state, { x, y }) {
      state.coordinates = { x, y };
    },

    [SET_HOVERED_DATE](state, date) {
      state.hoveredDate = date;
    },

    [SET_ACTIVE_RECORDS](state, records) {
      state.detailedRecords = records;
    },

    [SET_LINKED_PAIRS](state, pairs) {
      state.linkedPairs = pairs;
      state.linkageMap = zipObject(
        pairs.map(pair => pair.pair),
        pairs.map(pair => (pair.on_day ? ON_DAY_LINK : NEXT_DAY_LINK)),
      );
    },

    [CHANGE_LINKAGE_STATE](state, pair) {
      state.linkageMap = {
        ...state.linkageMap,
        ...pair,
      };
    },
  },
};
