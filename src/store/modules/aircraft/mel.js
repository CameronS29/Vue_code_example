import melAPI from 'api/dispatch/mel';
import { findIndex } from 'lodash';
import update from 'immutability-helper';

const state = {
  categories: ['A', 'B', 'C', 'D'],
  categoriesDefaultExpiration: [3, 3, 10, 120],

  MEL: [],

  currentMELItem: null,
};

const getters = {
  MEL: state => state.MEL,
};

const actions = {
  async fetchMEL({ state, commit }) {
    const MEL = await melAPI.getMEL(state.correction);

    commit('setMEL', MEL);
  },
  async deleteMELItem({ commit }, item) {
    await melAPI.delete(item.id);

    commit('delete', item.id);
  },
  async updateMELItem({ commit }, item) {
    commit('update', item.id
      ? await melAPI.patch(item)
      : await melAPI.post(item));
  },
};

const mutations = {
  setMEL(state, MEL) {
    state.MEL = MEL;
  },
  setCurrentMELItem(state, item) {
    state.currentMELItem = item;
  },
  update(state, item) {
    const index = findIndex(state.MEL, { id: item.id });

    if (index > -1) {
      state.MEL = update(state.MEL, { [index]: { $merge: item } });
    } else {
      state.MEL = [...state.MEL, item];
    }
  },
  delete(state, id) {
    state.MEL = state.MEL.filter(item => item.id !== id);
  },
};

export default {
  namespaced: true,

  state,
  getters,
  mutations,
  actions,
};
