const SET_PORTAL_ACTIVE = 'SET_PORTAL_ACTIVE';

export default {
  namespaced: true,

  state: {
    portalActive: true,
  },

  getters: {
    isPortalActive: state => state.portalActive,
  },

  actions: {
    setPortalActive({ commit }, flag) {
      commit(SET_PORTAL_ACTIVE, flag);
    },
  },

  mutations: {
    [SET_PORTAL_ACTIVE](state, flag) {
      state.portalActive = flag;
    },
  },
};
