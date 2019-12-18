import update from 'immutability-helper';
import { findIndex } from 'lodash';

import * as filterTypes from 'Common/Filters/types';
import flightListApi from 'api/dispatch/flight-list';
import flightsApi from 'api/flights';
import StatusChange from './status-change';
import createTableStore from '../../factory/table';

export const TABLE_NAMESPACE = 'dispatch/flight-list/table';
export const SET_AVAILABLE_OPERATIONS = 'SET_AVAILABLE_OPERATIONS';
export const SET_AVAILABLE_OPERATING_UNDER = 'SET_AVAILABLE_OPERATING_UNDER';
export const SET_AVAILABLE_FLIGHT_NUMBERS = 'SET_AVAILABLE_FLIGHT_NUMBERS';
export const PATCH_FLIGHT = 'PATCH_FLIGHT';
export const SET_SELECTED_FLIGHT_IDS = 'SET_SELECTED_FLIGHT_IDS';
export const TOGGLE_AIRCRAFT_TYPE_DIALOG = 'TOGGLE_AIRCRAFT_TYPE_DIALOG';
export const DELETE_FLIGHT = 'DELETE_FLIGHT';

export const tableModule = {
  mutations: {
    [PATCH_FLIGHT](state, flightCommit) {
      const index = findIndex(state.results, { id: flightCommit.id });

      if (index > -1) {
        state.results = update(state.results, {
          [index]: {
            $merge: flightCommit,
          },
        });
      }
    },
    [DELETE_FLIGHT](state, flightId) {
      state.results = state.results.filter(flight => flight.id !== flightId);
    },
  },
};

export default {
  namespaced: true,

  state: {
    isFlightsEditable: false,
    selectedFlightIds: [],

    availableOperations: [],
    availableOperatingUnder: [],
    availableFlightNumbers: [],
    availableFilters: [
      { key: 'flight_number', label: 'Flight Number', type: filterTypes.FLIGHT_NUMBER, value: [] },
      { key: 'show_deactivated', label: 'Show deactivated', type: filterTypes.FLAG, value: false },
      { key: 'route', label: 'Route', type: filterTypes.IATAS, value: [] },
      { key: 'origin', label: 'Origin', type: filterTypes.IATAS, value: [] },
      { key: 'destination', label: 'Destination', type: filterTypes.IATAS, value: [] },
      { key: 'scheduled_departure', label: 'Scheduled Departure', type: filterTypes.DATE_RANGE, value: [null, null] },
      { key: 'scheduled_arrival', label: 'Scheduled Arrival', type: filterTypes.DATE_RANGE, value: [null, null], },
      { key: 'type_of_operations', label: 'Operation Type', type: filterTypes.OPERATION_TYPES, value: [], },
      { key: 'operating_under', label: 'Operating Under', type: filterTypes.OPERATING_UNDER, value: [], },
      { key: 'aircraft', label: 'Tail Number', type: filterTypes.AIRCRAFTS, value: [], },
      { key: 'pic', label: 'PIC', type: filterTypes.PIC, value: [], },
      { key: 'sic', label: 'SIC', type: filterTypes.SIC, value: [], },
      { key: 'actual_datetime_out', label: 'Actual OUT', type: filterTypes.DATE_TIME_RANGE, value: [null, null], },
      { key: 'actual_datetime_off', label: 'Actual OFF', type: filterTypes.DATE_TIME_RANGE, value: [null, null], },
      { key: 'actual_datetime_in', label: 'Actual IN', type: filterTypes.DATE_TIME_RANGE, value: [null, null], },
      { key: 'actual_datetime_on', label: 'Actual ON', type: filterTypes.DATE_TIME_RANGE, value: [null, null], },
    ],

    isChangeAircraftTypeDialogActive: false,
  },

  getters: {},

  actions: {
    fetchAvailableOperations({ commit }) {
      return flightListApi.getOperations().then(operations => commit(SET_AVAILABLE_OPERATIONS, operations));
    },
    fetchAvailableOperatingUnder({ commit }) {
      return flightListApi
        .getOperationUnder().then(operatingUnder => commit(SET_AVAILABLE_OPERATING_UNDER, operatingUnder));
    },
    fetchAvailableFlightNumbers({ commit }) {
      return flightListApi
        .getFlightNumbers().then(flightNumbers => commit(SET_AVAILABLE_FLIGHT_NUMBERS, flightNumbers));
    },

    async setAircraftType({ state, commit }, typeId) {
      const data = state.selectedFlightIds.map(id => ({
        flight: id,
        aircraft_type: typeId,
      }));

      await flightsApi.changeAircraftType(data);
    },
    async removeFlight({ commit }, flightId) {
      await flightsApi.removeFlight(flightId);

      commit(`table/${DELETE_FLIGHT}`, flightId);
    },
  },

  mutations: {
    [SET_AVAILABLE_OPERATIONS](state, operations) {
      state.availableOperations = operations;
    },
    [SET_AVAILABLE_OPERATING_UNDER](state, operatingUnder) {
      state.availableOperatingUnder = operatingUnder;
    },
    [SET_AVAILABLE_FLIGHT_NUMBERS](state, flightNumbers) {
      state.availableFlightNumbers = flightNumbers;
    },
    [SET_SELECTED_FLIGHT_IDS](state, flightIds) {
      state.selectedFlightIds = flightIds;
    },
    [TOGGLE_AIRCRAFT_TYPE_DIALOG](state, flag) {
      state.isChangeAircraftTypeDialogActive = flag;
    },
  },

  modules: {
    table: createTableStore(flightListApi, tableModule),
    'status-change': StatusChange,
  },
};
