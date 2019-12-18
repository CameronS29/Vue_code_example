import { findIndex, get } from 'lodash';
import update from 'immutability-helper';
import api from 'api/scheduling';

import { UPDATE_PAIRING, REMOVE_PAIRING } from './consts';

export default {
  namespaced: true,

  actions: {
    async setSinglePilot({ commit, dispatch }, { id, isSingle }) {
      const pair = await api.setPairSinglePilot({ id, isSingle });
      commit(UPDATE_PAIRING, pair);

      const { pilot, sic } = pair.record || {};
      dispatch(
        'scheduling/calendar/pilotGrid/updateRecords',
        { pilots: [get(pilot, 'id'), get(sic, 'id')] },
        { root: true },
      );
    },
  },

  mutations: {
    [UPDATE_PAIRING](state, pairing) {
      const pairingIndex = findIndex(state.results, { id: pairing.id });
      state.results = update(state.results, { [pairingIndex]: { $set: pairing } });
    },
    [REMOVE_PAIRING](state, pairingId) {
      const pairingIndex = findIndex(state.results, { id: pairingId });
      if (pairingIndex !== -1) {
        state.results.slice(pairingIndex, 1);
      }
    },
  },
};
