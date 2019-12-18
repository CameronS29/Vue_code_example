const SET_VISIBILITY = 'SET_VISIBILITY';
const SET_ACTIVE_ITEM = 'SET_ACTIVE_ITEM';

export default {
  namespaced: true,

  state: {
    isOpen: false,
    activeItem: null,
  },

  getters: {
    isOpen: state => state.isOpen,
    activeItem: state => state.activeItem,
  },

  actions: {
    showMenu({commit}) {
      commit(SET_VISIBILITY, true);
    },

    hideMenu({commit}) {
      commit(SET_VISIBILITY, false);
    },

    toggleMenu({commit, state: {isOpen}}) {
      commit(SET_VISIBILITY, !isOpen);
    },

    setActiveItem({commit}, menuItem) {
      commit(SET_ACTIVE_ITEM, menuItem);
    },
  },

  mutations: {
    [SET_VISIBILITY](state, show) {
      state.isOpen = show;
    },
    [SET_ACTIVE_ITEM](state, menuItem) {
      state.activeItem = (state.activeItem !== menuItem ? menuItem : null);
    },
  },
};
