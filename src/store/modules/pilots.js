import pilotsApi from '../../api/pilots';
import { find } from 'lodash';

export const RETRIEVE_PILOTS = 'RETRIEVE_PILOTS';
export const SELECT_PILOT = 'SELECT_PILOT';
export const CHOOSE_DELETE = 'CHOOSE_DELETE';
export const RESET_PILOT = 'RESET_PILOT';
export const SET_QUERY = 'SET_QUERY';
export const SET_FIRST_NAME = 'SET_FIRST_NAME';
export const SET_LAST_NAME = 'SET_LAST_NAME';
export const SET_EMAIL = 'SET_EMAIL';

export default {
  namespaced: true,

  state: {
    pilots: [],
    pilot: {},
    query: '',
    delete_pilot: null,
  },

  getters: {
    pilots: state => state.pilots,
    delete_pilot: state => state.delete_pilot,
    pilot: state => state.pilot,
    selectablePilots: ({ pilots }) => pilots.map(pilot => ({
      ...pilot,
      name: `${pilot.first_name} ${pilot.last_name}`,
    })),
    filteredPilots: state => state.pilots.filter((pilot) => {
      const lookup = `${pilot.first_name} ${pilot.last_name} ${pilot.email}`.toLowerCase();
      return lookup.indexOf(state.query) !== -1;
    }),
    pilotById: state => id => find(state.pilots, pilot => pilot.id === id),
  },

  actions: {
    getPilots({ commit }) {
      return pilotsApi.listPilots()
        .then(data => commit(RETRIEVE_PILOTS, data));
    },

    selectPilot({ commit }, id) {
      return id !== undefined
        ? pilotsApi.getPilot(id).then(data => commit(SELECT_PILOT, data))
        : Promise.resolve().then(() => commit(SELECT_PILOT, {}));
    },

    pushPilot({ commit, state, dispatch }) {
      return pilotsApi.pushPilot(state.pilot)
        .then(data => commit(SELECT_PILOT, data))
        .then(() => dispatch('getPilots'));
    },

    deletePilot({ dispatch }, id) {
      return pilotsApi.deletePilot(id)
        .then(() => dispatch('getPilots'));
    },
  },

  mutations: {
    [RETRIEVE_PILOTS](state, pilots) {
      state.pilots = pilots;
    },
    [SET_QUERY](state, query) {
      state.query = query.toLowerCase();
    },
    [SELECT_PILOT](state, pilot) {
      state.pilot = pilot;
    },
    [RESET_PILOT](state) {
      state.pilot = {};
    },
    [CHOOSE_DELETE](state, pk) {
      state.delete_pilot = pk;
    },
    [SET_FIRST_NAME](state, value) {
      state.pilot.first_name = value;
    },
    [SET_LAST_NAME](state, value) {
      state.pilot.last_name = value;
    },
    [SET_EMAIL](state, value) {
      state.pilot.email = value;
    },
  },
};
