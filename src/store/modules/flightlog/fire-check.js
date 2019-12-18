import Vue from "vue";
import moment from 'moment';
import flightManifestAPI from "../../../api/flight-manifest";

export const RECIEVE_FIRE_CHECK = "RECIEVE_FIRE_CHECK";
export const SET_CONFIRM = "SET_CONFIRM";
export const SET_ID = "SET_ID";
export const SET_DATE = "SET_DATE";
export const SET_ERRORS = "SET_ERRORS";
export const SET_PROGRESS = "SET_PROGRESS";
export const SET_PIC_PIN = "SET_PIC_PIN";
export const SET_PIC_INITIALS = "SET_PIC_INITIALS";
export const SET_MANIFEST_ID = "SET_MANIFEST_ID";
export const RESET_FIRE_CHECK = "RESET_FIRE_CHECK";

const getDefaultState = () => {
  return {
    fireCheck: {
        id: null,
        approve_date: moment().format("MM/DD/YYYY"),
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
    fireCheck: state => state.fireCheck,
    date: state => state.fireCheck.approve_date,
    picPin: state => state.fireCheck.pic_pin,
    picInitials: state => state.fireCheck.pic_initials,
    confirmed: state => state.confirmed,
    editable: state => !state.fireCheck.id,
    errors: state => state.errors,
    isValid: state => (state.confirmed === true && state.fireCheck.id) || state.confirmed === false
};


const actions = {
    getFireConfirmation({commit, state}, id) {
        flightManifestAPI.getFireConfirmation(id, fireCheck => {
            setTimeout(() => {commit(SET_PROGRESS, false)}, 500);
            commit(RECIEVE_FIRE_CHECK, fireCheck);
        });
    },
    pushFireConfirmation({commit, state}, id) {
        commit(SET_PROGRESS, true);
        flightManifestAPI.pushFireConfirmation(state.fireCheck, fireCheck => {
            setTimeout(() => {commit(SET_PROGRESS, false)}, 500);
            commit(RECIEVE_FIRE_CHECK, fireCheck);
            flightManifestAPI.setManifsetStatus({
                id: state.fireCheck.manifest,
                fire_status: 1
            }, res => {
                setTimeout(() => {commit(SET_PROGRESS, false)}, 500);
            });
        }, (errors) => {
            commit(SET_ERRORS, errors.non_field_errors);
            setTimeout(() => {commit(SET_PROGRESS, false)}, 500);
        });
    },
    deleteConfirmation({commit, state}, id) {
        if (state.fireCheck.id) {
            commit(SET_PROGRESS, true);
            flightManifestAPI.deleteFireConfirmation(state.fireCheck.id, ev => {
                commit(SET_ID, null);
                setTimeout(() => {commit(SET_PROGRESS, false)}, 500);
            });
        }
    },
    setStatus({commit, state}, id) {
        commit(SET_PROGRESS, true);
        flightManifestAPI.setManifsetStatus(
            {
                id: state.fireCheck.manifest,
                fire_status: (state.confirmed === true) ? 1 : (state.confirmed === false ? 2 : 0)
            },
            ev => {
                setTimeout(() => {commit(SET_PROGRESS, false)}, 500);
            }
        );
    }
};

const mutations = {
    [RECIEVE_FIRE_CHECK] (state, fireCheck) {
        Object.assign(state.fireCheck, fireCheck);
        state.fireCheck.pic_pin = "";
    },
    [SET_CONFIRM] (state, value) {
        state.confirmed = value;
    },
    [SET_ID] (state, id) {
        Vue.set(state.fireCheck, "id", id);
    },
    [SET_DATE] (state, date) {
        Vue.set(state.fireCheck, "approve_date", date);
        state.fireCheck.approve_date = date;
    },
    [SET_ERRORS] (state, errors) {
        state.errors = errors;
    },
    [SET_PROGRESS] (state, progress) {
        state.progress = progress;
    },
    [SET_PIC_PIN] (state, pic_pin) {
        state.fireCheck.pic_pin = pic_pin;
    },
    [SET_PIC_INITIALS] (state, pic_initials) {
        state.fireCheck.pic_initials = pic_initials;
    },
    [SET_MANIFEST_ID] (state, manifest) {
        Vue.set(state.fireCheck, "manifest", manifest);
    },
    [RESET_FIRE_CHECK] (state) {
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
