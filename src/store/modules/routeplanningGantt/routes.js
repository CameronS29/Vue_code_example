import { findIndex, uniq, map, concat, filter } from 'lodash';
import update from 'immutability-helper';
import Fuse from 'fuse.js';
import api from 'api/routeplanning/new';

export default {
  namespaced: true,
  state: {
    routes: [],
    search: '',
    type: null,
    destination: null,
    origin: null,
    activeRouteId: null,
  },
  getters: {
    filteredRoutes: ({origin, destination, routes, type }) => {
      let result = routes;
      if (type) {
        result = filter(result, route => route.type === type );
      }
      if (origin) {
        result = filter(result, route => route.origin === origin );
      }
      if (destination) {
        result = filter(result, route => route.destination === destination );
      }
      return result;
    },
    availableAirports({ routes }) {
      return uniq(concat(map(routes, 'origin'), map(routes, 'destination')));
    },
    availableTypes({ routes }) {
      return uniq(map(routes, 'type_name'));
    },
  },
  actions: {
    async getRoutes({ commit }) {
      const routes = await api.getRoutes();
      commit('setRoutes', routes);
    },
    async calcRoute({ commit }, { id, since }) {
      commit('patchRoute', { id, loading: true });
      const route = await api.calcRoute(id, { since });
      commit('patchRoute', { ...route, loading: false });
    },
    async calcRoutes({ commit }, since) {
      const routes = await api.calcRoutes({ since, only_routing: false });
      commit('setRoutes', routes);
    },
    async calcNewRoutes({ commit }, since) {
      const routes = await api.calcRoutes({ since, only_routing: true });
      commit('setRoutes', routes);
    },
    async patchRoute({ commit }, route) {
      await api.patchRoute(route);

      commit('patchRoute', route);
    },
  },
  mutations: {
    setRoutes(state, routes) {
      state.routes = routes;
    },
    setOrigin(state, value) {
      state.origin = value;
    },
    setDestination(state, value) {
      state.destination = value;
    },
    setType(state, value) {
      state.type = value;
    },
    patchRoute(state, route) {
      const routeIndex = findIndex(state.routes, { id: route.id });
      state.routes = update(state.routes, { [routeIndex]: { $merge: route } });
    },
  },
};
