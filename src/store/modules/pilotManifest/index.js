import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import identity from 'lodash/identity';
import pickBy from 'lodash/pickBy';
import tables from "./tables";
import createTableStore from '../../factory/table';
import pickFlight from './pick-flight';
import editFlight from './edit-flight';
import confirm from './confirm';
import * as consts from './consts';
import manifestAPI, {flightsApi} from '../../../api/pilotManifest';
import statusLogsAPI from '../../../api/pilotManifest/manifest-logs';

const state = {
  manifest: {},
  duties: {},
  statusLogs: {},
  partialUpdate: {},
  progress: 0,
  allProfiles: [],
  availableAirports: [],
  validateTryCount: 0,
  invalidFieldsCount: 0,
  savedIndication: false,
  activeNumberChangeModal: false,
  flightOptions: {
    operations: [],
    opsUnder: [],
    approaches: [],
    delays: [],
    bases: []
  }
};

const getters = {
  manifest: state => state.manifest,
  duties: state => state.duties,
  savedIndication: state => state.savedIndication,
  statusLogs: state => state.statusLogs,
  picDuty: state =>state.duties[state.manifest.pic_duty],
  sicDuty: state => state.duties[state.manifest.sic_duty],
  inprogress: state => (state.progress > 0),
  allProfiles: state => state.allProfiles,
  availableProfiles: state => filter(state.allProfiles, {is_active: true}),
  availablePICPilots: state => filter(state.allProfiles, {is_pic: true, is_active: true}),
  availableSICPilots: state => filter(state.allProfiles, {is_sic: true, is_active: true}),
  availablePilots: state => filter(state.allProfiles, pilot => pilot.is_sic || pilot.is_pic),
  availableAirports: state => state.availableAirports,
  operations: state => state.flightOptions.operations,
  opsUnder: state => state.flightOptions.opsUnder,
  delays: state => state.flightOptions.delays,
  approaches: state => state.flightOptions.approaches,
  bases: state => state.flightOptions.bases,
  validateTryCount: state => state.validateTryCount,
  invalidFieldsCount: state => state.invalidFieldsCount,
  activeNumberChangeModal: state => state.activeNumberChangeModal,

};

const actions = {
  pushManifest({ commit, dispatch, state }) {
    commit(consts.INC_PROGRESS);

    return manifestAPI.pushManifest(state.manifest)
      .then(data => commit(consts.UPDATE_MANIFEST, data))
      .finally(() => commit(consts.DEC_PROGRESS));
  },
  updateManifestNumber({commit, state}, number) {
    const { manifest: { id } } = state;
    return manifestAPI.updateManifestNumber(id, number)
      .then(data=> commit(consts.UPDATE_MANIFEST, data));
  },
  getManifest({commit, dispatch}, id) {
    commit(consts.INC_PROGRESS)
    return manifestAPI.getManifest(id).then(data => {
      commit(consts.RECIEVE_MANIFEST, data);
      dispatch('getDuty', data.pic_duty);
      dispatch('getDuty', data.sic_duty);
      return true;
    }).finally(()=>commit(consts.DEC_PROGRESS));
  },
  refreshManifest({commit}, id) {
    manifestAPI.getManifest(id)
      .then(data => commit(consts.RECIEVE_MANIFEST, data));
  },
  blinkSaveIndication({commit}) {
    commit(consts.SAVED_INDICATION_ON);
    setTimeout(() => commit(consts.SAVED_INDICATION_OFF), 2000);
  },
  updateManifest({commit, dispatch}, data) {
    return manifestAPI.getManifest(id)
      .then(data => commit(consts.RECIEVE_MANIFEST, data))
      .finally(()=> dispatch('blinkSaveIndication'));
  },
  patchManifest({ commit, dispatch, state }) {
    const { manifest: { id }, partialUpdate } = state;
    commit(consts.CLEAR_PARTIAL_UPDATE);

    return manifestAPI.patchManifest(id, partialUpdate, state)
      .finally(dispatch('blinkSaveIndication'));
  },
  saveManifest({ commit, dispatch, state }) {
    const { manifest } = state;
    commit(consts.CLEAR_PARTIAL_UPDATE);

    return manifestAPI.patchManifest(manifest.id, pickBy(manifest, identity), state)
      .then(data => commit(consts.UPDATE_MANIFEST, data));
  },
  getDuty({commit}, id) {
    commit(consts.UPDATE_DUTY, {id, progress: true});
    return manifestAPI.getDuty(id)
      .then(res => commit(consts.UPDATE_DUTY, res))
      .finally(()=>commit(consts.UPDATE_DUTY, {id, progress: false}));
  },
  patchDuty({commit}, data) {
    const {id} = data;
    commit(consts.UPDATE_DUTY, {id, progress: true});
    return manifestAPI.patchDuty(data.id, data)
      .then(res => commit(consts.UPDATE_DUTY, res))
      .finally(()=>commit(consts.UPDATE_DUTY, {id, progress: false}));
  },
  reset({ commit, dispatch }) {
    commit(consts.RESET_MANIFEST);
  },

  getAvailableProfiles({ commit }) {
    return manifestAPI.getAllProfiles()
      .then(profiles => commit(consts.RECEIVE_PROFILES, profiles));
  },

  getFlightOptions({ commit }) {
    return manifestAPI.getFlightOptions()
      .then(opsUnder => commit(consts.RECEIVE_FLIGHT_OPTIONS, opsUnder));
  },

  getStatusLogs({ commit, state }, id) {
    return statusLogsAPI.getStatusLogs(id || state.manifest.id)
      .then(data => commit(consts.RECEIVE_STATUS_LOGS, data));
  },

  setPartialUpdate({ commit }, payload) {
    commit(consts.SET_PARTIAL_UPDATE, payload);
  },

  getAvailableAirports({ commit }) {
    return manifestAPI.getAirports()
      .then(airports => commit(consts.RECEIVE_AIRPORTS, airports));
  },

  validateLog({commit}, id) {
    return manifestAPI.validateLog(id);
  }

};

const mutations = {
  [consts.RECEIVE_FLIGHT_OPTIONS](state, options) {
    state.flightOptions = options;
  },
  [consts.UPDATE_MANIFEST](state, manifest) {
    state.manifest = {
      ...state.manifest,
      ...manifest,
    };
  },
  [consts.RECIEVE_MANIFEST](state, manifest) {
    state.manifest = manifest;
  },
  [consts.RESET_MANIFEST](state) {
    state.manifest = {};
  },
  [consts.SAVED_INDICATION_ON](state) {
    state.savedIndication = true;
  },
  [consts.SAVED_INDICATION_OFF](state) {
    state.savedIndication = false;
  },
  [consts.INC_PROGRESS](state) {
    state.progress += 1;
  },
  [consts.DEC_PROGRESS](state) {
    state.progress -= 1;
  },
  [consts.RECEIVE_PROFILES](state, profiles) {
    state.allProfiles = profiles;
  },
  [consts.SET_PARTIAL_UPDATE](state, data) {
    state.partialUpdate = {
      ...state.partialUpdate,
      ...data,
    };
    state.manifest = {
      ...state.manifest,
      ...data,
    };
  },
  [consts.CLEAR_PARTIAL_UPDATE](state) {
    state.partialUpdate = {};
  },
  [consts.VALIDATE_COMPLETE](state) {
    state.validateTryCount = state.validateTryCount + 1;
    state.invalidFieldsCount = 0;
  },
  [consts.SET_VALIDATE_STATUS](state, hasError) {
    if (hasError) {
      state.invalidFieldsCount = state.invalidFieldsCount + 1;
    }
  },
  [consts.RECEIVE_AIRPORTS](state, airports) {
    state.availableAirports = airports;
  },
  [consts.RECEIVE_STATUS_LOGS](state, statusLogs) {
    state.statusLogs = statusLogs;
  },
  [consts.UPDATE_DUTY](state, data) {
    state.duties = {
      ...state.duties,
      [data.id]: {
        ...state.duties[data.id],
        ...data
      }
    };
  },
  [consts.SET_NUMBER_CHANGE_MODAL](state, val) {
    state.activeNumberChangeModal = val;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
  modules: {
    tables,
    pickFlight,
    editFlight,
    confirm,
    flights: createTableStore(flightsApi),
  }
}
