import { DateTime } from 'luxon';
import update from 'immutability-helper';
import { findIndex, keyBy, mapValues, find } from 'lodash';

import { crewCurrency } from 'api/scheduling';
import flightListApi from 'api/dispatch/flight-list';
import legalityApi from 'api/fdt/legality';
import loaderMixin, { affectLoading, affectLoadingNs } from 'store/helpers/loading';

export const TAIL_STATUSES = ['UP', 'DOWN', 'STBY', 'AOG'];
export const TAIL_STATUS_ORDER = [0, 3, 2, 1];
export const AIRCRAFT_TYPES = {
  1: 'pc12',
  2: 'pc12',
  3: 'be300',
};
export const AIRCRAFT_TYPE_NAMES = {
  1: 'PC-12',
  2: 'PC-12',
  3: 'BE300',
};

export default loaderMixin({
  namespaced: true,

  state: {
    startDate: null,
    flightRange: 1.5, // days
    airportInfoProps: {
      metar: true,
      notam: false,
      taf: false,
      notes: true,
    },

    flights: {},
    pilots: [],
    airports: {},
    legality: {},
  },

  getters: {
    startDateUTC: state => DateTime.fromISO(state.startDate)
      .setZone('utc', { keepLocalTime: true }),
    atLeastOneAirportInfoPropEnabled: ({ airportInfoProps }) => find(airportInfoProps, prop => prop),
  },
  actions: {
    @affectLoading
    async fetchFlights({ commit, getters, state, rootState }, flightNumbers) {
      const { results } = await flightListApi.getFilteredResults({
        flight_number: flightNumbers,
        scheduled_departure_0: getters.startDateUTC.minus({ days: 1 })
          .toISODate(),
        scheduled_departure_1: getters.startDateUTC.plus({ days: state.flightRange + 1 })
          .toISODate(),
        size: 9999,
      });

      commit('setFlights', keyBy(results, 'id'));
    },
    @affectLoading
    async fetchFlightLegalities({ commit, getters, state, rootState }, flights) {
      const legalities = await legalityApi.perFlight(flights);

      commit('setLegality', keyBy(legalities, 'flight'));
    },
    @affectLoading
    async fetchPilots({ commit }, pilotIds) {
      if (!pilotIds.length) {
        return commit('setPilots', []);
      }

      const pilots = await crewCurrency.fetch(pilotIds);
      commit('setPilots', pilots);
    },
    @affectLoadingNs('dispatch/e-checklist/airportsLoading')
    async fetchAirports({ commit }, airportIds) {
      if (!airportIds.length) {
        return commit('setAirports', []);
      }

      const airports = await flightListApi.fetchAirportInfo(airportIds);
      commit('setAirports', mapValues(airports, (airport, id) => ({
        ...airport,
        id: parseInt(id),
      })));
    },
  },

  mutations: {
    setStartDate(state, date) {
      state.startDate = date;
    },
    setFlightRange(state, range) {
      state.flightRange = range;
    },
    setFlights(state, flights) {
      state.flights = flights;
    },
    setLegality(state, legalityMap) {
      state.legality = legalityMap;
    },
    setPilots(state, pilots) {
      state.pilots = pilots;
    },
    setAirports(state, airports) {
      state.airports = airports;
    },
    setAirportInfoProps(state, props) {
      state.airportInfoProps = { ...state.airportInfoProps, ...props };
    },
    patchFlight(state, flight) {
      if (!state.flights[flight.id]) return;

      state.flights = update(state.flights, {
        [flight.id]: {
          $merge: flight,
        },
      });
    },
  },

  modules: {
    airportsLoading: loaderMixin({ namespaced: true }),
  },
});
