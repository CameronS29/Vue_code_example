import { keyBy, uniqBy, find, findIndex, sortBy } from 'lodash';
import update from 'immutability-helper';

import api from 'api/routeplanning/new';
import { tableApi as flightTableApi } from 'api/flights';

export default {
  namespaced: true,
  state: {
    lines: [],
    flights: [],

    activeLineId: null,
  },
  getters: {
    sortedLines: ({ lines }) => {
      return sortBy(lines, 'id');
    },
    flightMap: ({ flights }) => {
      return keyBy(flights, 'flight_number');
    },
    activeLine: ({ activeLineId, lines }) => {
      return find(lines, { id: activeLineId });
    },
  },
  actions: {
    async fetchFlights({ commit }) {
      const { results } = await flightTableApi.getFilteredResults({
        page: 1,
        scheduled: true,
        size: 9999,
      });

      commit('setFlights', uniqBy(results, 'flight_number'));
    },
    async getLines({ commit }) {
      const lines = await api.getLines();

      commit('setLines', lines);
    },
    async addLine({ commit }, name) {
      const line = await api.addLine({
        name,
        flight_numbers: [],
      });

      commit('addLine', line);
    },
    async deleteLine({ commit }, id) {
      await api.deleteLine(id);

      commit('deleteLine', id);
    },
    async patchLine({ commit }, line) {
      await api.patchLine(line);

      commit('patchLine', line);
    },
    async addFlightToActiveLine({ commit, getters }, flight) {
      const activeLine = getters.activeLine;
      const line = await api.patchLine({
        id: activeLine.id,
        flight_numbers: [...activeLine.flight_numbers, flight.flight_number],
      });

      commit('patchLine', line);
    },
    async removeFlightFromLine({ commit }, { flight, line }) {
      const syncedLine = await api.patchLine({
        id: line.id,
        flight_numbers: line.flight_numbers.filter(flight_number => flight_number != flight.flight_number),
      });

      commit('patchLine', syncedLine);
    },
    async removeFlightFromActiveLine({ commit, getters }, flight) {
      const activeLine = getters.activeLine;
      const line = await api.patchLine({
        id: activeLine.id,
        flight_numbers: activeLine.flight_numbers.filter(flight_number => flight_number != flight.flight_number),
      });

      commit('patchLine', line);
    },
  },
  mutations: {
    setLines(state, lines) {
      state.lines = lines;
    },
    addLine(state, line) {
      state.lines = [...state.lines, line];
    },
    deleteLine(state, id) {
      state.lines = state.lines.filter(line => line.id !== id);
    },
    patchLine(state, line) {
      const lineIndex = findIndex(state.lines, { id: line.id });
      state.lines = update(state.lines, { [lineIndex]: { $merge: line } });
    },
    setFlights(state, flights) {
      state.flights = flights;
    },
    setActiveLine(state, lineId) {
      state.activeLineId = lineId;
    },
  },
};
