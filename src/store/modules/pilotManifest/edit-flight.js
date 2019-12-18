import * as consts from './consts';
import manifestAPI from '../../../api/pilotManifest';

const state = {
    flight: {},
    active: false,
    progress: false,
};

const getters = {
    flight: state => state.flight,
    active: state => state.active,
    progress: state => state.progress,
};

const actions = {
  setFlight({commit}, flight) {
    commit(consts.SET_EDIT_FLIGHT, flight);
  },
  localUpdateFlight({commit}, data) {
    commit(consts.UPDATE_EDIT_FLIGHT, data);
  },
  saveFlight({commit, state}) {
    if (state.flight.id) {
      commit(consts.EDIT_FLIGHT_SET_PROGRESSS, true);
      return manifestAPI.patchFlight(state.flight.id, {...state.flight})
        .then((flight)=>commit(consts.UPDATE_EDIT_FLIGHT, flight))
        .finally(()=>commit(consts.EDIT_FLIGHT_SET_PROGRESSS, false));
    } else {
      commit(consts.EDIT_FLIGHT_SET_PROGRESSS, true);
      return manifestAPI.createFlight({...state.flight})
        .then((flight)=>commit(consts.UPDATE_EDIT_FLIGHT, flight))
        .finally(()=>commit(consts.EDIT_FLIGHT_SET_PROGRESSS, false));
    }
  },
  createNewLogWithFlight({commit, state}, manifest) {
    commit(consts.EDIT_FLIGHT_SET_PROGRESSS, true);
    return manifestAPI.createLog({manifest, flight: state.flight.id})
      .finally(()=>commit(consts.EDIT_FLIGHT_SET_PROGRESSS, false));
  },
  reset({commit}) {
    commit(consts.RESET_EDIT_FLIGHT);
  },
};

const mutations = {
    [consts.SET_EDIT_FLIGHT](state, flight) {
      state.flight = flight;
      state.active = true;
    },
    [consts.UPDATE_EDIT_FLIGHT](state, data) {
      state.flight = {...state.flight, ...data};
    },
    [consts.RESET_EDIT_FLIGHT](state) {
      state.flight = {};
      state.active = false;
    },
    [consts.EDIT_FLIGHT_SET_PROGRESSS](state, val) {
      state.progress = val;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
