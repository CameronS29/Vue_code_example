 import securityApi from '../../../api/security';

const SET_DELETE = 'SET_DELETE';
const SET_PENDING = 'SET_PENDING';
const RESET_DELETE = 'RESET_DELETE';

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
    deleteLog({ commit, dispatch, state: {log: {id}}}) {
      commit(SET_PENDING, true);
      return securityApi.deleteItem(id)
        .then(() => commit('security/table/securityItems/DELETE_ITEM', id, {root: true}))
        .then(() => dispatch('reset'))
        .finally(() => commit(SET_PENDING, false))
    },

    setLog({commit}, log) {
      commit(SET_DELETE, log);
    },

    reset({commit}) {
      commit(RESET_DELETE);
    },
  },

  mutations: {
    [RESET_DELETE](state) {
      state.log = {};
      state.pending = false;
    },

    [SET_DELETE](state, log) {
      state.log = log;
    },

    [SET_PENDING](state, status) {
      state.pending = status;
    },
  },
};


