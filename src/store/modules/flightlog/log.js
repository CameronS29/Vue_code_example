import * as consts from './consts';
import FlightLogAPI from '../../../api/flightlog';

const state = {
  log: {
    final_hobbs: null,
  },
  feature: {
    final_hobbs: null,
    initial_hobbs: null,
  },
};

const getters = {
  log: state => state.log,
  feature: state => state.feature,
};

const actions = {
  clearFlightLog({ commit }) {
    commit(consts.SET_FLIGHTLOG, { final_hobbs: null });
  },
  async getFlightLog({ commit }, id) {
    const data = await FlightLogAPI.getLog(id);
    commit(consts.SET_FLIGHTLOG, data);
  },
  async getFeatureFlightLog({ commit }, id) {
    const data = await FlightLogAPI.getFeatureLog(id);
    commit(consts.SET_FEATURE_FLIGHTLOG, data);
  },
};

const mutations = {
  [consts.SET_FLIGHTLOG](state, flightlog) {
    state.log = Object.assign({}, flightlog);
  },
  [consts.SET_FEATURE_FLIGHTLOG](state, flightlog) {
    state.feature = Object.assign({}, flightlog);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
