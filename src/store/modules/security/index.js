import map from 'lodash/map';
import * as consts from './consts';
import form from './form';
import table from './table';
import csv from './csv';
import del from './delete';
import securityAPI from '../../../api/security';

const state = {
  options: {
    search_reasons: [],
    external_check_list: [],
    internal_check_list: []
  },
  item: {

  },
  loading: false,
};

const getters = {
  reasons: state => map(state.options.search_reasons, r=>{ return {id: r[0], label: r[1]} }),
  externalCheckList: state => map(state.options.external_check_list, c=>{ return {id: c[0], label: c[1]} }),
  internalCheckList: state => map(state.options.internal_check_list, c=>{ return {id: c[0], label: c[1]} }),
  item: state => state.item,
  loading: state => state.loading,
};

const actions = {
  getSecurityOptions({ commit }) {
    return securityAPI.getOptions()
      .then(options => commit(consts.RECEIVE_OPTIONS, options));
  },
  getSecurityItem({ commit }, id) {
    commit(consts.SET_LOADING, true)
    return securityAPI.getItem(id)
      .then(data => commit(consts.RECEIVE_ITEM, data))
      .finally(() => commit(consts.SET_LOADING, false));
  }
};

const mutations = {
  [consts.RECEIVE_OPTIONS](state, options) {
    state.options = options;
  },
  [consts.RECEIVE_ITEM](state, data) {
    state.item = data;
  },
  [consts.SET_LOADING](state, value) {
    state.loading = value;
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
  modules: {
    form,
    table,
    csv,
    delete: del,
  }
};
