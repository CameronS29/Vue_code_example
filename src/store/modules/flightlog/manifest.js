import flightManifestAPI from "../../../api/flight-manifest";
import aircraftAPI from "../../../api/aircraft";
import vorCheck from "./vor-check";
import fireCheck from "./fire-check";
import logs from './manifest-logs';

export const RECIEVE_MANIFEST = "RECIEVE_MANIFEST";
export const OPEN_COMPLETE_WINDOW = "OPEN_COMPLETE_WINDOW";
export const CLOSE_COMPLETE_WINDOW = "CLOSE_COMPLETE_WINDOW";
export const RESET_FORWARDED = "RESET_FORWARDED";
export const RECIEVE_AIRCRAFT = "RECIEVE_AIRCRAFT";

import createLogStore from './manifests';
import * as consts from './consts';

const state = {
    manifest: {},
    aircraft: {},
    inprogress: false,
    completeWindowOpen: false
};

const getters = {
    manifest: state => state.manifest,
    completeWindowOpen: state => state.completeWindowOpen,
    inprogress: state => state.inprogress,
    aircraft: state => state.aircraft,
};


const actions = {
  getManifest({commit}, id) {
    commit(consts.SET_PROGRESS, true);
    return flightManifestAPI.getFlightManifest(id).then(({data}) => {
      commit(RECIEVE_MANIFEST, data);
    }).finally(() => commit(consts.SET_PROGRESS, false));
  },
  getAircraftData({commit}, id) {
    return aircraftAPI.fetchAircraft(id).then(({data}) => {
      commit(RECIEVE_AIRCRAFT, data);
    })
  }
};

const mutations = {
    [RECIEVE_MANIFEST] (state, manifest) {
        state.manifest = manifest;
    },
    [OPEN_COMPLETE_WINDOW] (state) {
        state.completeWindowOpen = true;
    },
    [CLOSE_COMPLETE_WINDOW] (state) {
        state.completeWindowOpen = false;
    },
    [consts.SET_PROGRESS] (state, val) {
      state.inprogress = val;
    },
    [RESET_FORWARDED] (state) {
      state.forwarded = {};
    },
    [RECIEVE_AIRCRAFT] (state, data) {
      state.aircraft = data;
    }

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
      vorCheck,
      fireCheck,
      logs,
      openLogs: createLogStore([
        consts.STATUS_OPEN,
        consts.STATUS_PENDING_PIC,
        consts.STATUS_DISPATCH_PENDING,
        consts.STATUS_DISPATCH_RE_OPEN,
      ]),
      completedLogs: createLogStore([
        consts.STATUS_COMPLETED,
      ]),
    }
}
