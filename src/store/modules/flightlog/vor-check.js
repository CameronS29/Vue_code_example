import Vue from "vue";
import moment from 'moment';
import flightManifestAPI from "../../../api/flight-manifest";

export const RECIEVE_VOR_CHECK = "RECIEVE_VOR_CHECK";
export const SET_STATION = "SET_STATION";
export const SET_FREQ = "SET_FREQ";
export const SET_ERRORS = "SET_ERRORS";
export const SET_ERROR = "SET_ERROR";
export const SET_ID = "SET_ID";
export const SET_PROGRESS = "SET_PROGRESS";
export const SET_DATE = "SET_DATE";
export const SET_PIC_PIN = "SET_PIC_PIN";
export const SET_PIC_INITIALS = "SET_PIC_INITIALS";
export const SET_MANIFEST_ID = "SET_MANIFEST_ID";
export const SET_CONFIRM = "SET_CONFIRM";
export const RESET_VOR_CHECK = "RESET_VOR_CHECK";

const getDefaultState = () => {
  return {
    vorCheck: {
        id: null,
        freq: null,
        error: 0,
        date: moment().format("MM/DD/YYYY"),
        station: null,
        pic_pin: null,
        pic_initials: null,
        manifest: null
    },
    confirmed: null,
    progress: false,
    errors: [],
  };
}

const state = getDefaultState();

const getters = {
    vorCheck: state => state.vorCheck,
    freq: state => state.vorCheck.freq,
    station: state => state.vorCheck.station,
    error: state => state.vorCheck.error,
    date: state => state.vorCheck.date,
    picPin: state => state.vorCheck.pic_pin,
    picInitials: state => state.vorCheck.pic_initials,
    confirmed: state => state.confirmed,
    errors: state => state.errors,
    progress: state => state.progress,
    editable: state => !state.vorCheck.id,
    isValid: state => (state.confirmed === true && state.vorCheck.id) || state.confirmed === false
};


const actions = {
    getVORConfirmation({commit, state}, id) {
        commit(SET_PROGRESS, true);
        flightManifestAPI.getVORConfirmation(id, vorCheck => {
            setTimeout(() => {commit(SET_PROGRESS, false)}, 500);
            commit(RECIEVE_VOR_CHECK, vorCheck);
        });
    },
    pushVORConfirmation({commit, state}, id) {
        commit(SET_PROGRESS, true);
        flightManifestAPI.pushVORConfirmation(state.vorCheck, vorCheck => {
            commit(RECIEVE_VOR_CHECK, vorCheck);

            flightManifestAPI.setManifsetStatus({
                id: state.vorCheck.manifest,
                vor_status: 1
            }, res => {
                setTimeout(() => {commit(SET_PROGRESS, false)}, 500);
            });

        }, (errors) => {
            commit(SET_ERRORS, errors.non_field_errors);
            setTimeout(() => {commit(SET_PROGRESS, false)}, 500);
        });
    },
    deleteConfirmation({commit, state}, id) {
        if (state.vorCheck.id) {
            commit(SET_PROGRESS, true);
            flightManifestAPI.deleteVORConfirmation(state.vorCheck.id, res => {
                commit(SET_ID, null);
                setTimeout(() => {commit(SET_PROGRESS, false)}, 500);
            });

        }
    },
    setStatus({commit, state}, id) {
        commit(SET_PROGRESS, true);
        flightManifestAPI.setManifsetStatus({
            id: state.vorCheck.manifest,
            vor_status: (state.confirmed === true) ? 1 : (state.confirmed === false ? 2 : 0)
        }, res=>{
            setTimeout(() => {commit(SET_PROGRESS, false)}, 500);
        });
    }
};

const mutations = {
    [RECIEVE_VOR_CHECK] (state, vorCheck) {
        Object.assign(state.vorCheck, vorCheck);
        state.vorCheck.pic_pin = "";
    },
    [SET_PROGRESS] (state, progress) {
        state.progress = progress;
    },
    [SET_ID] (state, id) {
        state.vorCheck.id = id;
    },
    [SET_STATION] (state, station) {
        Vue.set(state.vorCheck, "station", station);
    },
    [SET_FREQ] (state, freq) {
        Vue.set(state.vorCheck, "freq", freq);
    },
    [SET_ERROR] (state, error) {
        Vue.set(state.vorCheck, "error", error);
    },
    [SET_DATE] (state, date) {
        Vue.set(state.vorCheck, "date", date);
    },
    [SET_PIC_PIN] (state, pic_pin) {
        Vue.set(state.vorCheck, "pic_pin", pic_pin);
    },
    [SET_PIC_INITIALS] (state, pic_initials) {
        Vue.set(state.vorCheck, "pic_initials", pic_initials);
    },
    [SET_MANIFEST_ID] (state, manifest) {
        Vue.set(state.vorCheck, "manifest", manifest);
    },
    [SET_ERRORS] (state, errors) {
        state.errors = errors;
    },
    [SET_CONFIRM] (state, value) {
        state.confirmed = value;
    },
    [RESET_VOR_CHECK](state) {
      Object.assign(state, getDefaultState());
    }

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
