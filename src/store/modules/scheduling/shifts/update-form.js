import * as consts from 'store/modules/scheduling/consts';

const state = {
  form: {},
};

const getters = {
  form: state => state.form,
};

const mutations = {
  [consts.UPDATE_PAIR_FORM](state, payload) {
    state.form = {
      ...state.form,
      ...payload,
    };
  },

  [consts.RESET_PAIR_FORM](state) {
    state.form = {};
  },
};

const actions = {};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
