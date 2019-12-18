import update from 'immutability-helper';
import sync from './sync';
import flightListApi from '../../../api/dispatch/flight-list';
import flightsApi from 'api/flights';
import flightLogApi from '../../../api/flightlog';
import pilotManifestApi from '../../../api/pilotManifest';

export const SET_FLIGHT = 'SET_FLIGHT';
export const SET_FLIGHT_FOR_STATUS = 'SET_FLIGHT_FOR_STATUS';
export const SET_STATUS_LOGS = 'SET_STATUS_LOGS';
export const UPDATE_FLIGHT = 'UPDATE_FLIGHT';
export const CREATE_STATUS_LOG = 'CREATE_STATUS_LOG';
export const SET_EDIT_MODE = 'SET_EDIT_MODE';
export const SET_PICK_MODAL_SHOWN = 'SET_PICK_MODAL_SHOWN';

export const SCHEDULED_OPERATION = 'Scheduled';
export const CHARTER_OPERATION = 'Charter';
export const REPOSITION_OPERATION = 'Reposition';
export const MAINTENANCE_OPERATION = 'Maintenance';
export const TRAINING_OPERATION = 'Training';
export const OPERATION_MAP = {
  [SCHEDULED_OPERATION]: 1,
  [CHARTER_OPERATION]: 2,
  [REPOSITION_OPERATION]: 3,
  [MAINTENANCE_OPERATION]: 4,
  [TRAINING_OPERATION]: 5,
};

export default {
  namespaced: true,
  state: {
    flight: null,
    flightForStatus: null,
    statusLogs: [],
    editMode: false,

    isFlightPickModalShown: false,
  },
  getters: {},
  mutations: {
    [SET_FLIGHT](state, flight) {
      state.flight = flight;
    },
    [SET_FLIGHT_FOR_STATUS](state, flight) {
      state.SET_FLIGHT = flight;
    },
    [SET_STATUS_LOGS](state, statusLogs) {
      state.statusLogs = statusLogs;
    },
    [UPDATE_FLIGHT](state, flight) {
      if (flight.id === state.flight.id) {
        state.flight = flight;
      }
    },
    [CREATE_STATUS_LOG](state, statusLog) {
      if (statusLog.commit.flight.id === state.flight.id) {
        state.statusLogs = [statusLog, ...state.statusLogs];
      }
    },
    [SET_EDIT_MODE](state, flag) {
      state.editMode = flag;
    },
    [SET_PICK_MODAL_SHOWN](state, flag) {
      state.isFlightPickModalShown = flag;
    },
  },
  actions: {
    async fetchFlight({ commit, dispatch, state }, id) {
      const flight = await flightListApi.getFlight(id);

      commit(SET_FLIGHT, flight);
      dispatch('fetchFlightStatuses');

    },
    async fetchFlightStatuses({ commit, state }) {
      const statusLogs = await flightListApi.getFlightStatuses(state.flight.id);
      commit(SET_STATUS_LOGS, statusLogs);
    },
    async update({ commit, state }, flightProps) {
      if (flightProps['flightlog.fuel_burn'] !== undefined) {
        state.flight = update(state.flight, {
          flightlog: { fuel_burn: { $set: flightProps['flightlog.fuel_burn'] } }
        });
      }

      if (flightProps['flightlog.fuel_add_amount'] !== undefined) {
        state.flight = update(state.flight, {
          flightlog: { fuel_add_amount: { $set: flightProps['flightlog.fuel_add_amount'] } }
        });
      }


      console.log('update', flightProps);
    },
    async delete({ commit, state }, flightId) {
      await flightsApi.removeFlight(flightId);
    },
  },
  modules: {
    sync,
  },
};
