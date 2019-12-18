import { throttle, get } from 'lodash';

import wbLogAPI from '../../../api/wb/log';
import * as consts from './consts';

export default {
  state: {
    calculations: {},
    cgLimits: [],
    zeroFuelData: [],
    trimData: [],
  },

  getters: {
    calculations: state => state.calculations,
    getCalcValue: state => (field, defaultValue = undefined) => (
      get(state.calculations, field, defaultValue)
    ),
    cgLimits: state => state.cgLimits,
    zeroFuelData: state => state.zeroFuelData,
    trimData: state => state.trimData,
  },

  actions: {
    getCalculations: throttle(({ commit }, id) => (
      wbLogAPI.getCalculations(id)
        .then(data => commit(consts.UPDATE_CALCULATIONS, data))
    ), 3000, { leading: true, trailing: true }),

    getCGLimits({ commit }, aircraftType) {
      return wbLogAPI.getCGLimits(aircraftType).then((data) => {
        commit(consts.SET_CG_LIMITS, data.envelop_points);
        commit(consts.SET_TRIM_DATA, data.trim);
        commit(consts.SET_ZERO_FUEL_DATA, data.zero_fuel);
      });
    },

    resetCalculations({ commit }) {
      commit(consts.UPDATE_CALCULATIONS, {});
      commit(consts.SET_CG_LIMITS, []);
      commit(consts.SET_TRIM_DATA, []);
      commit(consts.SET_ZERO_FUEL_DATA, []);
    },
  },

  mutations: {
    [consts.SET_CG_LIMITS](state, cgLimits) {
      state.cgLimits = cgLimits;
    },
    [consts.SET_TRIM_DATA](state, trimData) {
      state.trimData = trimData;
    },
    [consts.SET_ZERO_FUEL_DATA](state, zeroFuelData) {
      state.zeroFuelData = zeroFuelData;
    },
    [consts.UPDATE_CALCULATIONS](state, calculations) {
      state.calculations = calculations;
    },
  },
};
