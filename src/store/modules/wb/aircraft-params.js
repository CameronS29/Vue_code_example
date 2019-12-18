import { findIndex, sortBy, pickBy } from 'lodash';
import update from 'immutability-helper';

import wbLogAPI from '../../../api/wb/log';
import * as consts from './consts';

export default {
  namespaced: true,

  state: {
    activeAircraftTypeId: null,
    activeAircraftId: null,
    arms: [],
    fuelLoads: [],
    envelopes: [],
  },

  getters: {
    arms: state => sortBy(state.arms, 'id'),
    fuelLoads: state => sortBy(state.fuelLoads, 'id'),
    envelopes: state => sortBy(state.envelopes, 'id'),
    showModal: state => (!!state.activeAircraftTypeId || !!state.activeAircraftId),
  },

  actions: {
    setActiveAircraftTypeId({ commit }, aircraftType) {
      if (!aircraftType) {
        commit(consts.SET_ACTIVE_AIRCRAFT_TYPE_ID, null);
        commit(consts.SET_ARMS, []);
        commit(consts.SET_FUEL_LOADS, []);
        commit(consts.SET_ENVELOPES, []);

        return;
      }

      const filters = { aircraft_type: aircraftType };

      return Promise.all([
        wbLogAPI.fetchArms(filters),
        wbLogAPI.fetchFuelLoadings(filters),
        wbLogAPI.fetchEnvelope(filters),
      ]).then(data => {
        commit(consts.SET_ARMS, data[0]);
        commit(consts.SET_FUEL_LOADS, data[1]);
        commit(consts.SET_ENVELOPES, data[2]);
        commit(consts.SET_ACTIVE_AIRCRAFT_ID, null);
        commit(consts.SET_ACTIVE_AIRCRAFT_TYPE_ID, aircraftType);
      });
    },

    setActiveAircraftId({ commit }, { aircraftId, aircraftTypeId }) {
      if (!aircraftId) {
        commit(consts.SET_ACTIVE_AIRCRAFT_ID, null);
        commit(consts.SET_ARMS, []);
        commit(consts.SET_FUEL_LOADS, []);
        commit(consts.SET_ENVELOPES, []);

        return;
      }

      const armFilters = { aircraft: aircraftId };
      const filters = { aircraft_type: aircraftTypeId };

      return Promise.all([
        wbLogAPI.fetchArms(armFilters),
        wbLogAPI.fetchFuelLoadings(filters),
        wbLogAPI.fetchEnvelope(filters),
      ]).then(data => {
        commit(consts.SET_ARMS, data[0]);
        commit(consts.SET_FUEL_LOADS, data[1]);
        commit(consts.SET_ENVELOPES, data[2]);
        commit(consts.SET_ACTIVE_AIRCRAFT_ID, aircraftId);
        commit(consts.SET_ACTIVE_AIRCRAFT_TYPE_ID, null);
      });
    },

    patchArm({ commit }, { id, value }) {
      commit(consts.SET_ARM_VALUE, { id, value });
      return wbLogAPI.patchArm({ id, value });
    },

    extractArms({ commit, state }) {
      if (!state.activeAircraftId) {
        return;
      }
      return wbLogAPI.extractArms(state.activeAircraftId)
        .then(arms => commit(consts.SET_ARMS, arms));
    },

    patchFuelLoad({ commit }, { id, data }) {
      commit(consts.UPDATE_FUEL_LOAD, { id, data });
      return wbLogAPI.patchFuelLoad({ id, data });
    },

    deleteFuelLoad({ commit }, id) {
      return wbLogAPI.deleteFuelLoad(id).then(fuelLoad => {
        commit(consts.DELETE_FUEL_LOAD, id);
      });
    },

    addFuelLoad({ commit, state }) {
      return wbLogAPI.addFuelLoad(state.activeAircraftTypeId).then(fuelLoad => {
        commit(consts.ADD_FUEL_LOAD, fuelLoad);
      });
    },

    patchEnvelope({ commit }, { id, data }) {
      commit(consts.UPDATE_ENVELOPE, { id, data });
      return wbLogAPI.patchEnvelope({ id, data });
    },

    deleteEnvelope({ commit }, id) {
      return wbLogAPI.deleteEnvelope(id).then(envelope => {
        commit(consts.DELETE_ENVELOPE, id);
      });
    },

    addEnvelope({ commit, state }) {
      return wbLogAPI.addEnvelope(state.activeAircraftTypeId).then(envelope => {
        commit(consts.ADD_ENVELOPE, envelope);
      });
    },
  },

  mutations: {
    [consts.SET_ACTIVE_AIRCRAFT_TYPE_ID](state, id) {
      state.activeAircraftTypeId = id;
    },
    [consts.SET_ACTIVE_AIRCRAFT_ID](state, id) {
      state.activeAircraftId = id;
    },
    [consts.SET_ARMS](state, arms) {
      state.arms = arms;
    },
    [consts.SET_FUEL_LOADS](state, fuelLoads) {
      state.fuelLoads = fuelLoads;
    },
    [consts.SET_ENVELOPES](state, envelopes) {
      state.envelopes = envelopes;
    },
    [consts.SET_ARM_VALUE](state, { id, value }) {
      const index = findIndex(state.arms, { id });

      state.arms = update(state.arms, { [index]: { $merge: { value } } });
    },
    [consts.UPDATE_FUEL_LOAD](state, { id, data }) {
      const index = findIndex(state.fuelLoads, { id });

      state.fuelLoads = update(state.fuelLoads, { [index]: { $merge: data } });
    },
    [consts.DELETE_FUEL_LOAD](state, id) {
      state.fuelLoads = state.fuelLoads.filter(fuelLoad => fuelLoad.id !== id);
    },
    [consts.ADD_FUEL_LOAD](state, fuelLoad) {
      state.fuelLoads = [...state.fuelLoads, fuelLoad];
    },
    [consts.UPDATE_ENVELOPE](state, { id, data }) {
      const index = findIndex(state.envelopes, { id });

      state.envelopes = update(state.envelopes, { [index]: { $merge: data } });
    },
    [consts.DELETE_ENVELOPE](state, id) {
      state.envelopes = state.envelopes.filter(envelope => envelope.id !== id);
    },
    [consts.ADD_ENVELOPE](state, envelope) {
      state.envelopes = [...state.envelopes, envelope];
    },
  },
};
