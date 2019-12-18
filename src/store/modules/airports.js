import { find, filter } from 'lodash';
import airportsApi from 'api/airports';

export const SET_AVAILABLE_AIRPORTS = 'SET_AVAILABLE_AIRPORTS';

export default {
  namespaced: true,

  state: {
    airports: [],
  },

  getters: {
    airports: state => state.airports,
    baseAirports: state => filter(state.airports, 'base'),
    pilotBases: state => filter(state.airports, 'has_pilots'),
    byId: state => id => find(state.airports, { id }),
    byIATA: state => iata => find(state.airports, { iata }),
  },

  actions: {
    async getAllAvailableAirports({ commit }) {
      const airports = await airportsApi.airportsList();
      commit(SET_AVAILABLE_AIRPORTS, airports);
    },
  },

  mutations: {
    [SET_AVAILABLE_AIRPORTS](state, airports) {
      state.airports = airports;
    },
  },
};
