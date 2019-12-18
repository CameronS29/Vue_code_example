import manifestApi from '../../../api/dispatch/manifest';
import FlightLogAPI from '../../../api/flightlog';
import { SET_COMPLETE_LOG, RESET_COMPLETE_LOG, COMPLETING_LOG } from './consts';

export default {
  namespaced: true,

  state: {
    log: {manifset: {}, flight: {}},
    pending: false,
  },

  getters: {
    log: state => state.log,
    isLoaded: state => !state.pending,
  },

  actions: {
    completeLog({commit, dispatch, state}) {
      commit(COMPLETING_LOG, true);
      return FlightLogAPI.patchFlightlog(
        state.log.id,
        {open: false},
        state,
      )
      .then(() => commit(COMPLETING_LOG, false))
      .then(() => dispatch('manifest/logs/getManifestLogs', state.log.manifest.id, {root: true}))
      .then(() => dispatch('reset'))
    },

    setCompleteLog({commit}, log) {
      commit(SET_COMPLETE_LOG, log);
    },

    reset({commit}) {
      commit(RESET_COMPLETE_LOG);
    },
  },

  mutations: {
    [RESET_COMPLETE_LOG](state) {
      state.log = {manifset: {}, flight: {}};
      state.pending = false;
    },

    [SET_COMPLETE_LOG](state, log) {
      state.log = log;
    },

    [COMPLETING_LOG](state, status) {
      state.pending = status;
    },
  },
};
