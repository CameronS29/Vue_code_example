import * as consts from './consts';
import securityAPI from '../../../api/security';

const state = {
    form: {},
    progress: false,
};

const getters = {
  form: state => state.form,
  progress: state => state.progress,
};

const actions = {
  saveFormData({ commit, state }, data) {
    commit(consts.SET_PROGRESS, true);
    return securityAPI.saveForm(state.form)
      .then((res) => {commit(consts.RESET_FORM); return res})
      .finally(()=>commit(consts.SET_PROGRESS, false));
  },
};

const mutations = {
  [consts.UPDATE_FORM](state, payload) {
    state.form = {
      ...state.form,
      ...payload
    };
  },
  [consts.RESET_FORM](state) {
    state.form = {};
  },
  [consts.SET_PROGRESS](state, value) {
    state.progress = value;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
