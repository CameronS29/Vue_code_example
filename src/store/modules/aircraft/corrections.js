import aircraftAPI from "../../../api/aircraft";
import * as consts from "./consts";

const state = {
    corrections: [],
    aircraft: null
};

const getters = {
    corrections: state => state.corrections,
    selectedAircraft: (state, getters, rootState, rootGetters) => {
        return rootState.aircraft.aircrafts.filter(a => a.id === state.aircraft)[0];
    }
};

const actions = {
    getCorrections({commit}, aircraft) {
        commit(consts.SET_CORRECTION_LIST_AIRCRAFT, aircraft);
        aircraftAPI.listCorrections(aircraft).then(data => {
            commit(consts.SET_CORRECTIONS, data);
        });
    },
  deleteCorrection({commit}, id) {
    return aircraftAPI.deleteCorrection(id);
  }
};

const mutations = {
    [consts.SET_CORRECTION_LIST_AIRCRAFT](state, aircraft) {
        state.aircraft = aircraft;
    },
    [consts.SET_CORRECTIONS](state, corrections) {
        state.corrections = corrections;
    },
    [consts.RESET_CORRECTIONS](state) {
        state.corrections = [];
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}

