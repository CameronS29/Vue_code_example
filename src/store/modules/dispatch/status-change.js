import { filter } from 'lodash';
import { DateTime } from 'luxon';

import flightListApi from '../../../api/dispatch/flight-list';
import { TABLE_NAMESPACE, PATCH_FLIGHT } from './flight-list';

export const SET_EDITABLE_FLIGHT = 'SET_EDITABLE_FLIGHT';
export const SET_EDITABLE_FLIGHTS = 'SET_EDITABLE_FLIGHTS';
export const RESET_EDITABLE = 'RESET_EDITABLE';
export const SET_AVAILABLE_OFFICIAL_CODES = 'SET_AVAILABLE_OFFICIAL_CODES';
export const SET_CODE_FILTER = 'SET_CODE_FILTER';
export const SET_STATUS = 'SET_STATUS';
export const SET_CODE = 'SET_CODE';
export const ACTIVATE = 'ACTIVATE';
export const DEACTIVATE = 'DEACTIVATE';
export const SET_REASON = 'SET_REASON';
export const SET_BAD_WEATHER = 'SET_BAD_WEATHER';
export const SET_DELAY_HOURS = 'SET_DELAY_HOURS';
export const SET_DELAY_MINUTES = 'SET_DELAY_MINUTES';

export const FLIGHT_STATUSES = {
  1: 'En Route',
  2: 'Landed',
  3: 'Cancelled',
  4: 'Delayed',
  5: 'On Time',
};
export const COMPLETION_STATUSES = {
  ...FLIGHT_STATUSES,
  0: 'Scheduled',
};
export const FLIGHT_STATUS_CLASS = {
  1: 'en-route',
  2: 'landed',
  3: 'canceled',
  4: 'delayed',
  5: 'on-time',
};
export const ERROR_STATUSES = [3, 4];

const formatCommit = (state, getters, estimatedDeparture, estimatedArrival) => ({
  official_code: getters.isInErrorStatus ? state.code : null,
  flight_status: state.status,
  reason: getters.isInErrorStatus ? state.reason : null,
  bad_weather: getters.isInErrorStatus ? state.bad_weather : null,
  estimated_departure: state.status === 4 ? estimatedDeparture : undefined,
  estimated_arrival: state.status === 4 ? estimatedArrival : undefined,
});

const shiftDate = (scheduled, hoursShift, minutesShift) => {
  return DateTime.fromISO(scheduled, { zone: 'utc' })
    .plus({
      hours: hoursShift,
      minutes: minutesShift,
    })
    .toISO();
};

export default {
  namespaced: true,

  state: {
    active: false,
    editableFlightId: null,
    editableFlights: [],

    availableOfficialCodes: [],
    availableFlightStatuses: FLIGHT_STATUSES,
    completionFlightStatuses: COMPLETION_STATUSES,

    codeFilter: '',
    code: null,
    status: null,
    originalStatus: null,
    reason: null,
    bad_weather: null,
    is_delayed: null,
    scheduled_departure: null,
    scheduled_arrival: null,

    delayHours: 0,
    delayMinutes: 0,
  },

  getters: {
    filteredCodes: (state) => {
      if (!state.codeFilter) return state.availableOfficialCodes;

      return filter(state.availableOfficialCodes, (code) => {
        return `${code.code}${code.verbose}${code.description}`
          .toUpperCase()
          .indexOf(state.codeFilter.toUpperCase()) > -1;
      });
    },
    editableFlightIds(state) {
      return state.editableFlights.map(flight => flight.id);
    },
    isInErrorStatus(state) {
      return ERROR_STATUSES.indexOf(state.status) !== -1 || state.is_delayed;
    },
    isSingleFlightEditing(state) {
      return state.editableFlightId;
    },
    estimatedDeparture(state) {
      return shiftDate(state.scheduled_departure, state.delayHours, state.delayMinutes);
    },

    estimatedArrival(state) {
      return shiftDate(state.scheduled_arrival, state.delayHours, state.delayMinutes);
    },
  },

  actions: {
    async getAvailableOfficialCodes({ commit }) {
      const codes = await flightListApi.getAvailableOfficialCodes();
      commit(SET_AVAILABLE_OFFICIAL_CODES, codes);
    },
    async patchEditableFlight({ commit, state, getters }, mutationPath = `${TABLE_NAMESPACE}/${PATCH_FLIGHT}`) {
      const commitProps = {
        ...formatCommit(state, getters, getters.estimatedDeparture, getters.estimatedArrival),
        flight: state.editableFlightId,
      };

      const { flight_info } = await flightListApi.changeFlightStatus(commitProps);
      commit(mutationPath, flight_info, { root: true });
    },
    async patchEditableFlights({ commit, state, getters }, mutationPath = `${TABLE_NAMESPACE}/${PATCH_FLIGHT}`) {
      const commitProps = state.editableFlights.map(flight => ({
        ...formatCommit(
          state,
          getters,
          shiftDate(flight.scheduled_departure, state.delayHours, state.delayMinutes),
          shiftDate(flight.scheduled_arrival, state.delayHours, state.delayMinutes),
        ),
        flight: flight.id,
      }));

      const results = await flightListApi.changeFlightBatchStatus(commitProps);

      results.forEach(({ flight_info }) => {
        commit(mutationPath, flight_info, { root: true });
      });
    },
  },

  mutations: {
    [SET_EDITABLE_FLIGHT](state, flight) {
      let delayHours = 0;
      let delayMinutes = 0;

      if (flight.estimated_departure) {
        const diff = DateTime.fromISO(flight.estimated_departure)
          .diff(DateTime.fromISO(flight.scheduled_departure), ['hours', 'minutes']);

        delayHours = diff.hours;
        delayMinutes = diff.minutes;
      }

      state.editableFlightId = flight.id;
      state.editableFlights = [];

      state.code = flight.official_code;
      state.status = flight.status;
      state.originalStatus = flight.status;
      state.reason = flight.reason;
      state.bad_weather = flight.bad_weather;
      state.delayHours = delayHours;
      state.delayMinutes = delayMinutes;
      state.scheduled_departure = flight.scheduled_departure;
      state.is_delayed = flight.is_delayed;
      state.scheduled_arrival = flight.scheduled_arrival;

      state.active = true;
    },
    [SET_EDITABLE_FLIGHTS](state, flights) {
      state.editableFlightId = null;
      state.editableFlights = flights;

      state.code = null;
      state.status = null;
      state.reason = null;
      state.bad_weather = null;
      state.delayHours = 0;
      state.delayMinutes = 0;
      state.scheduled_departure = null;
      state.scheduled_arrival = null;
    },
    [RESET_EDITABLE](state) {
      state.editableFlightId = null;
      state.editableFlights = [];
      state.code = null;
      state.status = null;
      state.reason = null;
      state.bad_weather = null;
      state.delayHours = 0;
      state.delayMinutes = 0;
      state.scheduled_departure = null;
      state.scheduled_arrival = null;
    },
    [SET_AVAILABLE_OFFICIAL_CODES](state, codes) {
      state.availableOfficialCodes = codes;
    },
    [SET_CODE_FILTER](state, search) {
      state.codeFilter = search;
    },
    [SET_STATUS](state, statusId) {
      state.status = statusId;
    },
    [SET_CODE](state, codeId) {
      state.code = codeId;
    },
    [ACTIVATE](state) {
      state.active = true;
    },
    [DEACTIVATE](state) {
      state.active = false;
      state.editableFlightId = null;
    },
    [SET_REASON](state, reason) {
      state.reason = reason;
    },
    [SET_BAD_WEATHER](state, bad_weather) {
      state.bad_weather = bad_weather;
    },
    [SET_DELAY_HOURS](state, hours) {
      state.delayHours = hours;
    },
    [SET_DELAY_MINUTES](state, minutes) {
      state.delayMinutes = minutes;
    },
  },
};

