import * as consts from "./consts";
import inspectionsAPI from "../../../api/inspections";


const state = {
  aircrafts: [],
};
const getters = {};
const actions = {
  getInspections({ state, commit }) {
    inspectionsAPI.listAircrafts().then(data => commit(consts.ADD_INSPECTION_AIRCRAFTS, data));
  },
};
const mutations = {
  [consts.ADD_INSPECTION_AIRCRAFTS](state, aircrafts) {
    state.aircrafts = aircrafts;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
