import { pickBy, find  } from 'lodash';
import loaderMixin, { affectLoading } from 'store/helpers/loading';

import * as consts from './consts';
import FlightLogAPI from '../../../api/flightlog';

import log from './log';
import deleteLog from './delete-log';
import completeLog from './complete-log';
import inOutTime from './in-out-time';

const state = {
  flightlogs: [],
  flightlog: {
    flight: {
      diversion_type: consts.NO_DIVERSION,
    }
  },
  partialUpdate: {},
  page: 1,
  size: 100,
  total: 0,
  blockUpdate: true,
  selected_id: null,
  filters: {
    distinct: null,
    is_last: null,
    manifest: null,
    actual_datetime_out_0: null,
    actual_datetime_out_1: null,
  },
  calcNightTimeFlag: 0,
  savedIndication: false,
  diversionTypes: [
    {name: "Regular", value: consts.NO_DIVERSION},
    {name: "Diversion", value: consts.DIVERSION},
    {name: "Gate return", value: consts.GATE_RETURN},
    {name: "Air return", value: consts.AIR_RETURN}
  ],
};
const getters = {
  filters: state => state.filters,
  flightlogs: state => state.flightlogs,
  diversionTypes: state => state.diversionTypes,
  flightlog: state => state.flightlog,
  page: state => state.page,
  selectedId: state => state.selected_id,
  size: state => state.size,
  total: state => state.total,
  calcNightTimeFlag: state => state.calcNightTimeFlag,
  savedIndication: state => state.savedIndication,
  isAirReturn: state => state.flightlog.flight.diversion_type === consts.AIR_RETURN,
  isGateReturn: state => state.flightlog.flight.diversion_type === consts.GATE_RETURN,
  origin: (state, getters, rootState, rootGetters) => {
    return find(rootGetters['pilotManifest/availableAirports'], { id: state.flightlog.flight.origin_id }) || {};
  },
  destination: (state, getters, rootState, rootGetters) => {
    return find(rootGetters['pilotManifest/availableAirports'], { id: state.flightlog.flight.destination_id }) || {};
  },
  actualOrigin: (state, getters, rootState, rootGetters) => {
    return find(rootGetters['pilotManifest/availableAirports'], { id: state.flightlog.flight.actual_origin_id }) || {};
  },
  actualDestination: (state, getters, rootState, rootGetters) => {
    return find(rootGetters['pilotManifest/availableAirports'], { id: state.flightlog.flight.actual_destination_id }) || {};
  },

};

const actions = {
  @affectLoading
  async updateFlightLog({ state, commit }) {
    const { filters, size, page } = state;
    const data = await FlightLogAPI.getFilteredLogs(filters, size, page);

    commit(consts.SET_FLIGHTLOGS, data.results);
    commit(consts.SET_TOTAL, data.count);
  },

  @affectLoading
  async getFlightLog({ commit }, id) {
    const data = await FlightLogAPI.getFlightLog(id);
    commit(consts.SET_FLIGHTLOG, data);
  },

  updateDiversionType({commit, dispatch, state}, diversionType) {
    if (diversionType === consts.GATE_RETURN) {
      const gateReturnData = {
        flight_time: 0,
        night_flight_time: 0,
        instrument_flight_time: 0,
        final_hobbs: state.flightlog.initial_hobbs,
        number_of_takeoffs_day: 0,
        number_of_takeoffs_night: 0,
        number_of_landings_day: 0,
        number_of_landings_night: 0,
        actual_datetime_off: null,
        actual_datetime_on: null,
      };
      dispatch('setPartialUpdate', gateReturnData);
      dispatch('patchFlightlog', diversionType);
    }
    commit(consts.SET_DIVERSION_TYPE, diversionType);
    return FlightLogAPI.changeDiversionType({
      flight: state.flightlog.flight.id,
      diversion_type: diversionType
    }).then(() => dispatch("getFlightLog", state.flightlog.id));
  },
  updateActualDestination({commit, dispatch, state}, airportId) {
    commit(consts.SET_ACTUAL_DESTINATION, airportId);
    return FlightLogAPI.changeFlightAirport({
      flight: state.flightlog.flight.id,
      airport_value: airportId,
      airport_type: 1
    }).then(() => dispatch("getFlightLog", state.flightlog.id));
  },
  updateActualOrigin({commit, dispatch, state}, airportId) {
    commit(consts.SET_ACTUAL_ORIGIN, airportId);
    return FlightLogAPI.changeFlightAirport({
      flight: state.flightlog.flight.id,
      airport_value: airportId,
      airport_type: 0
    }).then(() => dispatch("getFlightLog", state.flightlog.id));
  },

  @affectLoading
  copyFlight({commit, dispatch, state}, flightId) {
    return FlightLogAPI.copyFlight({
      copy_from: flightId,
    });
  },

  @affectLoading
  async patchFlightlog({ commit, dispatch, state }, partial = true) {
    const { flightlog: { id }, partialUpdate } = state;
    const { flightlog } = state;

    commit(consts.CLEAR_PARTIAL_UPDATE);
    await FlightLogAPI.patchFlightlog(
      id,
      partial ? partialUpdate : pickBy(flightlog),
      state,
    );

    dispatch('blinkSaveIndication');
  },

  setPartialUpdate({ commit }, payload) {
    commit(consts.SET_PARTIAL_UPDATE, payload);
  },

  @affectLoading
  forceSync({ commit, state }) {
    const { flightlog: { id } } = state;
    return FlightLogAPI.forceSync(id);
  },

  blinkSaveIndication({ commit }) {
    commit(consts.SAVED_INDICATION_ON);
    setTimeout(() => commit(consts.SAVED_INDICATION_OFF), 2000);
  },
};

const mutations = {
  [consts.SET_FLIGHTLOGS](state, flightlogs) {
    state.flightlogs = flightlogs;
  },
  [consts.SET_PAGE](state, page) {
    state.page = page;
  },
  [consts.SET_TOTAL](state, total) {
    state.total = total;
  },
  [consts.SET_SIZE](state, size) {
    state.size = size;
  },
  [consts.RESET_PAGE](state) {
    state.page = 1;
  },
  [consts.RESET_FILTERS](state) {
    state.filters = {
      distinct: null,
      is_last: null,
      manifest: null,
      actual_datetime_out_0: null,
      actual_datetime_out_1: null,
    };
  },
  [consts.SET_SELECTED_ID](state, selected_id) {
    state.selected_id = selected_id;
  },
  [consts.SET_AIRCRAFT_FILTER](state, aircraft) {
    state.filters.aircraft = aircraft;
  },
  [consts.SET_IS_LAST_FILTER](state, is_last) {
    state.filters.is_last = is_last;
  },
  [consts.SET_DATETIME_OUT_1](state, datetime_out_1) {
    state.filters.actual_datetime_out_0 = datetime_out_1;
  },
  [consts.SET_DATETIME_OUT_2](state, datetime_out_2) {
    state.filters.actual_datetime_out_1 = datetime_out_2;
  },
  [consts.SET_FLIGHTLOG](state, data) {
    state.flightlog = data;
  },
  [consts.SET_DIVERSION_TYPE](state, diversion_type) {
    state.flightlog.flight.diversion_type = diversion_type;
  },
  [consts.SET_ACTUAL_DESTINATION](state, actual_destination) {
    state.flightlog.flight.actual_destination_id = actual_destination;
  },
  [consts.SET_ACTUAL_ORIGIN](state, actual_origin) {
    state.flightlog.flight.actual_origin_id = actual_origin;
  },
  [consts.SET_PARTIAL_UPDATE](state, data) {
    state.partialUpdate = {
      ...state.partialUpdate,
      ...data,
    };
    state.flightlog = {
      ...state.flightlog,
      ...data,
    };
  },
  [consts.CLEAR_PARTIAL_UPDATE](state) {
    state.partialUpdate = {};
  },
  [consts.UPDATE_FLIGHT](state, flight) {
    state.flightlog = { ...state.flightlog, flight };
  },
  [consts.SET_NIGHT_INFO_PROGRESS](state, val) {
    state.nightInfoProgress = val;
  },
  [consts.INC_CALC_NIGHT_TIME_FLAG](state) {
    state.calcNightTimeFlag += 1;
  },
  [consts.SAVED_INDICATION_ON](state) {
    state.savedIndication = true;
  },
  [consts.SAVED_INDICATION_OFF](state) {
    state.savedIndication = false;
  },
};
export default loaderMixin({
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    log,
    delete: deleteLog,
    complete: completeLog,
    'in-out-time': inOutTime,
  },
});
