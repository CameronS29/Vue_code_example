const UPDATE_FORM = "UPDATE_FORM";

const state = {
  form: {
    title: "",
  }
};
const actions = {};
const getters = {
  form: state => state.form,
};
const mutations = {
  [UPDATE_FORM](state, payload) {
    state.form = {
      ...state.form,
      ...payload
    };
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {}
}
