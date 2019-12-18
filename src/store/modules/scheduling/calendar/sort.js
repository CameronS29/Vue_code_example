import { pickBy } from 'lodash';
import { CHANGE_SORT, CHANGE_DAY_SORT } from '../consts';

const state = {
  sortBy: {},
  daySort: null,
};

const getters = {};

const actions = {};

const mutations = {
  [CHANGE_SORT](state, fields) {
    fields.forEach(field => {
      if (state.sortBy[field]) {
        if (state.sortBy[field] == 'asc') {
          state.sortBy = { ...state.sortBy, [field]: 'desc' };
        } else {
          state.sortBy = pickBy(state.sortBy, (value, key) => key !== field);
        }
      } else {
        state.sortBy = { ...state.sortBy, [field]: 'asc' };
      }
    });
  },
  [CHANGE_DAY_SORT](state, sort) {
    state.daySort = sort;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,

  modules: {},
};

