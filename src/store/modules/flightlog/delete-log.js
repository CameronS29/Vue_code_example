import manifestApi from '../../../api/dispatch/manifest';
import { SET_DELETE_LOG, RESET_DELETE_LOG, DELETING_LOG } from './consts';

export default {
  namespaced: true,

  state: {
    log: {},
    pending: false,
  },

  getters: {
    log: state => state.log,
    isLoaded: state => !state.pending,
  },

  actions: {
    deleteLog({commit, dispatch, state: {log: {id, manifest}}}) {
      commit(DELETING_LOG, true);
      console.log(manifest.id);
      return manifestApi.deleteLog(id)
        .then(() => commit(DELETING_LOG, false))
        .then(() => {
          dispatch('manifest/logs/getManifestLogs', manifest.id, {root: true});
          dispatch('pilotManifest/getManifest', manifest.id, {root: true});
          dispatch('reset')
        });

    },

    setLog({commit}, log) {
      commit(SET_DELETE_LOG, log);
    },

    reset({commit}) {
      commit(RESET_DELETE_LOG);
    },
  },

  mutations: {
    [RESET_DELETE_LOG](state) {
      state.log = {};
      state.pending = false;
    },

    [SET_DELETE_LOG](state, log) {
      state.log = log;
    },

    [DELETING_LOG](state, status) {
      state.pending = status;
    },
  },
};
