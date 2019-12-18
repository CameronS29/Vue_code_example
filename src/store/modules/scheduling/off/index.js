import { findIndex } from 'lodash';
import update from 'immutability-helper';

import api from "../../../../api/scheduling";
import * as consts from "store/modules/scheduling/consts";
import loaderMixin, { affectLoading } from "store/helpers/loading";

const state = {
  dayOffTypes: [],
  notSubmittedType: {
    id: null,
    abbr: '',
    name: '',
    total_included: true,
    paid_included: false,
  }
};

const getters = {
  notSubmittedType(state) {
    return state.notSubmittedType;
  }
};

const actions = {
  @affectLoading
  async fetchDayOffTypes({ commit }) {
    const dayOffTypes = await api.getDayOffTypes();
    commit(consts.SET_DAY_OFF_TYPES, dayOffTypes);
  },

  async saveDayOffType({ commit }, payload) {
    if (payload.id) {
      await api.patchDayOffType(payload);
    } else {
      await api.postDayOffType(payload);
    }
  },

  async deleteDayOffType({ commit }, id) {
    await api.deleteDayOffType(id);
    commit(consts.DELETE_DAY_OFF_TYPE, id);
  },

  async patchDayOffType({ commit }, payload) {
    await api.patchDayOffType(payload);
    commit(consts.PATCH_DAY_OFF_TYPE, payload);
  },
};

const mutations = {
  [consts.UPDATE_NOT_SUBMITTED_DAY_OFF_FORM](state, payload) {
    state.notSubmittedType = {
      ...state.notSubmittedType,
      ...payload
    };
  },

  [consts.SET_DAY_OFF_TYPES](state, types) {
    state.dayOffTypes = types;
  },

  [consts.ADD_DAY_OFF_TYPE](state, payload) {
    state.dayOffTypes = [...state.dayOffTypes, payload];
  },

  [consts.DELETE_DAY_OFF_TYPE](state, id) {
    state.dayOffTypes = state.dayOffTypes.filter(type => type.id !== id);
  },

  [consts.PATCH_DAY_OFF_TYPE](state, type) {
    const index = findIndex(state.dayOffTypes, { id: type.id });
    state.dayOffTypes = update(state.dayOffTypes, { [index]: { $set: type } });
  },
};

export default loaderMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,

  modules: {},
});
