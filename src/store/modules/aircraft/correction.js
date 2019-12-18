import aircraftAPI from "../../../api/aircraft";
import * as consts from "./consts";

const initialCorrection = {
  aircraft: null,
  date_of_install: null,
  performed_on: null,
  last_log: null,
  hobbs: 0,
  aftt: 0,
  landings: 0,
  engine_1_time: 0,
  engine_1_cycles: 0,
  engine_2_time: 0,
  engine_2_cycles: 0,
  notes: null,
};
const state = {
  correction: Object.assign({}, initialCorrection)
};

const getters = {
  aircraft: state => state.correction.aircraft,
  correction: state => state.correction.correction,
  installDate: state => state.correction.performed_on,
  lastLog: state => state.correction.last_log,
  selectedAircraft: (state, getters, rootState, rootGetters) => {
    if (rootState.aircraft.aircrafts) {
      return rootState.aircraft.aircrafts.filter(e => e.id === state.correction.aircraft)[0];
    }
  }
};

const actions = {
  updateCorrection({state, commit}) {
    return aircraftAPI.pushCorrection(state.correction).then((data) => commit(consts.SET_CORRECTION, data));
  },
  getCorrection({commit}, id) {
    return aircraftAPI.getCorrection(id).then(data => {
      commit(consts.SET_CORRECTION, data);
    });
  }
};

const mutations = {
  [consts.SET_INSTALL_DATE](state, date) {
    state.correction.performed_on = date;
  },
  [consts.SET_LAST_LOG](state, log) {
    state.correction.last_log = log;
  },
  [consts.SET_AIRCRAFT](state, aircraft) {
    state.correction.aircraft = aircraft;
  },
  [consts.UPDATE_CORRECTION](state, payload) {
    state.correction = {
      ...state.correction,
      ...payload
    };
  },
  [consts.SET_CORRECTION](state, correction) {
    state.correction = Object.assign({}, correction);
  },
  [consts.RESET_CORRECTION](state) {
    state.correction = Object.assign({}, initialCorrection);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
