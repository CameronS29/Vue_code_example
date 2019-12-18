const SET_NEW_HASH = 'SET_NEW_HASH';
const SET_SHUTDOWN = 'SET_SHUTDOWN';

export default {
  namespaced: true,

  state: {
    isDown: false,
    hash: undefined,
    prevHash: undefined,
  },

  getters: {
    isDown: state => state.isDown,
    hasChanged: state => (
      state.prevHash !== undefined
      && state.hash !== state.prevHash
      && state.hash
    ),
  },

  actions: {
    updateHash({ commit }, newHash) {
      commit(SET_SHUTDOWN, false);
      commit(SET_NEW_HASH, newHash);
    },

    shutdown({ commit }) {
      commit(SET_SHUTDOWN, true);
    },
  },

  mutations: {
    [SET_NEW_HASH](state, hash) {
      state.prevHash = state.hash;
      state.hash = hash;
    },

    [SET_SHUTDOWN](state, isDown) {
      state.isDown = isDown;
    },
  },
};
