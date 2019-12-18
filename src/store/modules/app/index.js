import { SET_ACTIVE_DATE_RANGE, } from 'store/modules/scheduling/consts';

import sidebar from './sidebar';
import header from './header';
import update from './update';

export default {
  namespaced: true,
  state: {
    isShiftPressed: false,
    windowHeight: window.innerHeight,
  },
  actions: {
    processShiftPress({ commit, rootGetters }, flag) {
      commit('setShiftPressed', flag);

      if (!flag && !rootGetters['scheduling/calendar/pairBinding/isShown']) {
        commit(`scheduling/calendar/pairBinding/${SET_ACTIVE_DATE_RANGE}`, [], { root: true });
      }
    },
  },
  mutations: {
    setShiftPressed(state, flag) {
      state.isShiftPressed = flag;
    },
    setWindowHeight(state, height) {
      state.windowHeight = height;
    },
  },
  modules: {
    sidebar,
    header,
    update,
  },
};
