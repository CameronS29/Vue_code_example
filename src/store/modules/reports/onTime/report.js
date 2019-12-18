import { map, head, last, zip, zipObject, toPairs } from 'lodash';

import reportsApi from 'api/reports';
import optionsApi from 'api/options';
import createTable from 'store/factory/table';

export const route = createTable(reportsApi);

const SET_REPORT = 'SET_REPORT';
const SET_COMMUNITIES_REPORT = 'SET_COMMUNITIES_REPORT';
const SET_FLIGHT_OPTIONS = 'SET_FLIGHT_OPTIONS';
const SET_FLIGHT_MANIFEST_OPTIONS = 'SET_FLIGHT_MANIFEST_OPTIONS';
const SET_PILOT_OPTIONS = 'SET_PILOT_OPTIONS';
const SET_PENDING = 'SET_PENDING';

export default {
  state: {
    totalStats: {},
    routeStats: [],
    communitiesReport: [],

    pilots: [],
    operations: [],
    operatingUnder: [],
    delays: [],
    aircrafts: [],
    aircraftTypes: [],
    airports: [],
    pending: 0,
  },

  getters: {
    totalStats: state => state.totalStats,
    routeStats: (state) => {
      const pairLists = toPairs(state.routeStats);
      const keys = map(pairLists, head);
      const values = map(pairLists, last);

      const propList = zip(...values);
      return map(propList, prop => zipObject(keys, prop));
    },

    communitiesReport: state => (
      map(state.communitiesReport, ({ title, data, totals }) => {
        const pairLists = toPairs(data);
        const keys = map(pairLists, head);
        const values = map(pairLists, last);

        const propList = zip(...values);
        return { title, totals, data: map(propList, prop => zipObject(keys, prop)) };
      })
    ),

    communitiesTotals: state => state.communitiesReport
      .map(({ title, totals }) => ({ title, ...totals })),

    pilots: state => state.pilots,
    operations: state => state.operations,
    operatingUnder: state => state.operatingUnder,
    delays: state => state.delays,
    aircrafts: state => state.aircrafts,
    aircraftTypes: state => state.aircraftTypes,
    airports: state => state.airports,

    isPending: state => state.pending > 0,
  },

  actions: {
    fetchReport({ commit }, filters) {
      commit(SET_PENDING, 1);

      return reportsApi.onTimePerformance(filters)
        .then(data => commit(SET_REPORT, data[0]))
        .finally(() => commit(SET_PENDING, -1));
    },

    getCommunitiesReport({ commit }, filters) {
      commit(SET_PENDING, 1);

      return reportsApi.getCommunitiesReport(filters)
        .then(data => commit(SET_COMMUNITIES_REPORT, data))
        .finally(() => commit(SET_PENDING, -1));
    },

    getFilters({ commit }) {
      commit(SET_PENDING, 1);
      return Promise.all([
        optionsApi.getFlightOptions().then(data => commit(SET_FLIGHT_OPTIONS, data)),
        optionsApi.getFlightManifestOptions().then(data => commit(SET_FLIGHT_MANIFEST_OPTIONS, data)),
        optionsApi.getPilotOptions().then(data => commit(SET_PILOT_OPTIONS, data)),
      ]).finally(() => commit(SET_PENDING, -1));
    },

    resetReport({ commit }) {
      commit(SET_REPORT, {});
    },
  },

  mutations: {
    [SET_REPORT](state, { data, totals }) {
      state.routeStats = data;
      state.totalStats = totals;
    },

    [SET_COMMUNITIES_REPORT](state, report) {
      state.communitiesReport = report;
    },

    [SET_PENDING](state, pending) {
      state.pending += pending;
    },

    [SET_PILOT_OPTIONS](state, pilots) {
      state.pilots = pilots;
    },

    [SET_FLIGHT_MANIFEST_OPTIONS](state, data) {
      state.operations = data.operations;
      state.operatingUnder = data.operating_under;
      state.delays = data.delays;
    },

    [SET_FLIGHT_OPTIONS](state, data) {
      state.aircrafts = data.aircrafts;
      state.aircraftTypes = data.aircraft_types;
      state.airports = data.airports;
    },
  },
};
