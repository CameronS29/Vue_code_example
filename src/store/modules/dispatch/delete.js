import manifestApi from '../../../api/dispatch/manifest';

const SET_DELETE = 'SET_DELETE';
const SET_PENDING = 'SET_PENDING';
const RESET_DELETE = 'RESET_DELETE';

export default {
  namespaced: true,

  state: {
    manifest: {},
    pending: false,
  },

  getters: {
    manifest: state => state.manifest,
    isLoaded: state => !state.pending,
  },

  actions: {
    deleteManifest({commit, dispatch, state: {manifest: {id}}}) {
      commit(SET_PENDING, true);
      return manifestApi.deleteManifest(id)
        .then(() => commit(SET_PENDING, false))
        .then(() => commit('dispatch/tables/pendingManifests/DELETE', id, {root: true}))
        .then(() => commit('dispatch/tables/allManifests/DELETE', id, {root: true}))
        .then(() => dispatch('reset'));
    },

    setManifest({commit}, manifest) {
      commit(SET_DELETE, manifest);
    },

    reset({commit}) {
      commit(RESET_DELETE);
    },
  },

  mutations: {
    [RESET_DELETE](state) {
      state.manifest = {};
      state.pending = false;
    },

    [SET_DELETE](state, manifest) {
      state.manifest = manifest;
    },

    [SET_PENDING](state, status) {
      state.pending = status;
    },
  },
};
