import manifestApi from '../../../api/dispatch/manifest';
import {STATUS_DISPATCH_PENDING} from '../flightlog/consts';

import {DateTime} from 'luxon';
const SET_PENDING = 'SET_PENDING';
const SET_CONFIRMATION = 'SET_CONFIRMATION';
const RESET_CONFIRMATION = 'RESET_CONFIRMATION';
export const SET_COMMENT = 'SET_COMMENT';
export const UPDATE_APPROVAL_DATA = 'UPDATE_APPROVAL_DATA';
export const UPDATE_MANIFEST = 'UPDATE_MANIFEST';

export default {
  namespaced: true,

  state: {
    manifest: {},
    comment: '',
    pending: false
  },

  getters: {
    isLoaded: state => !state.pending,
    manifest: state => state.manifest,
    comment: state => state.comment,
  },

  actions: {
    confirm({ commit, dispatch, state: { manifest: { id }, comment } }, status) {
      commit(SET_PENDING, true);

      return manifestApi.setManifestStatus(id, { comment, status })
        .then(() => {
          dispatch('reset');
          commit(UPDATE_MANIFEST, {status});
          commit('pilotManifest/UPDATE_MANIFEST', {status}, {root: true});
        }).finally(()=>commit(SET_PENDING, false))
    },
    setManifest({ commit }, manifest) {
      commit(SET_CONFIRMATION, manifest);
    },

    reset({ commit }) {
      commit(RESET_CONFIRMATION);
    },
  },

  mutations: {
    [RESET_CONFIRMATION](state) {
      state.manifest = {};
      state.comment = '';
      state.approvalData = {
        pin: '',
        initials: '',
        created: DateTime.utc().toFormat('yyyy-MM-dd')
      };
      state.pending = false;
    },

    [SET_CONFIRMATION](state, manifest) {
      state.manifest = manifest;
    },

    [SET_COMMENT](state, comment) {
      state.comment = comment;
    },
    [SET_PENDING](state, status) {
      state.pending = status;
    },
    [UPDATE_MANIFEST](state, data) {
      state.manifest = {
        ...state.manifest,
        ...data,
      };
    },
    [UPDATE_APPROVAL_DATA](state, data) {
      state.approvalData = {
        ...state.approvalData,
        ...data,
      };
    }
  },
};
