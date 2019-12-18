import { last, first, sortBy } from 'lodash';
import optionsApi from 'api/options';
import schedulingApi from 'api/scheduling';
import { filter } from 'lodash/collection';
import { DateTime } from 'luxon';

export const RESET_REQUEST = 'RESET_REQUEST';
export const UPDATE_REQUEST = 'UPDATE_REQUEST';
export const SET_PILOT_OPTIONS = 'SET_PILOT_OPTIONS';
export const SET_PICKED_FLIGHTS = 'SET_PICKED_FLIGHTS';
const defaultRequest = {
  id: null,
  position: 1,
  base: null,
  duty_start: null,
  duty_end: null,
  priority: 2,
  pilots: [],
};
export default {
  namespaced: true,
  state: {
    request: {
      ...defaultRequest,
    },

    flights: [],
    pilots: [],
  },
  actions: {
    getPilotOptions({ commit }) {
      optionsApi.getPilotOptions().then(data => commit(SET_PILOT_OPTIONS, data));
    },
    getOpenTime({ commit }, id) {
      schedulingApi.getOpenTime(id).then(data => commit(UPDATE_REQUEST, data));
    },
    async updateOpenTime({ commit, state, getters }) {
      const data = await schedulingApi.updateOpenTime({...state.request, flights: getters.flightIds});
      commit(UPDATE_REQUEST, data);
    },
    async cancelOpenTime({ commit, state }) {
      return commit(UPDATE_REQUEST, await schedulingApi.cancelOpenTime(state.request.id));
    },
    async approveOpenTime({ commit, state }) {
      return commit(UPDATE_REQUEST, await schedulingApi.approveOpenTime(state.request.id));
    },
    async declineOpenTime({ commit, state }) {
      return commit(UPDATE_REQUEST, await schedulingApi.declineOpenTime(state.request.id));
    },
    async acceptOpenTime({ commit, state }) {
      return commit(UPDATE_REQUEST, await schedulingApi.acceptOpenTime(state.request.id));
    },
  },
  getters: {
    request: state => state.request,
    flights: state => sortBy(state.flights, flight => DateTime.fromISO(flight.scheduled_departure)),
    flightIds: state => state.flights.map(flight => flight.id),
    lastFlight: (state, getters) => last(getters.flights),
    firstFlight: (state, getters) => first(getters.flights),
    pilots: state => (state.request.base ? filter(state.pilots, { base_id: state.request.base }) : state.pilots),
  },
  mutations: {
    [RESET_REQUEST](state) {
      state.request = {
        ...defaultRequest,
      };
      state.flights = [];
    },
    [UPDATE_REQUEST](state, payload) {
      state.request = {
        ...state.request,
        ...payload,
      };
    },
    [SET_PILOT_OPTIONS](state, pilots) {
      state.pilots = pilots;
    },
    [SET_PICKED_FLIGHTS](state, flights) {
      state.flights = flights;
    },
  },
};
