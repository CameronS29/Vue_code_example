import manifestApi from '../../../api/dispatch/manifest';
import {STATUS_DISPATCH_PENDING} from '../flightlog/consts';
import * as consts from './consts';
import {DateTime} from 'luxon';


export default {
  namespaced: true,

  state: {
    manifest: {},
    approvalData: {
      pin: '',
      initials: '',
      created: DateTime.utc().toFormat('yyyy-MM-dd')
    },
    pending: false
  },

  getters: {
    isLoaded: state => !state.pending,
    manifest: state => state.manifest,
    approvalData: state => state.approvalData,
  },

  actions: {
    confirm({ commit, dispatch, state: { manifest: { id }} }, status) {
      commit(consts.SET_PENDING, true);

      return manifestApi.setManifestStatus(id, { status })
        .then(() => {
          dispatch('reset');
          commit(consts.UPDATE_MANIFEST, {status});
          commit('pilotManifest/UPDATE_MANIFEST', {status}, {root: true});
        }).finally(()=>commit(consts.SET_PENDING, false))
    },
    picConfirm({commit, dispatch, state: { manifest: {id}, approvalData: {pin, initials, created} }}) {
      commit(consts.SET_PENDING, true);

      return manifestApi.picConfirm({manifest: id, pin, initials, created })
        .then(() => {
          dispatch('reset');
          commit(consts.UPDATE_MANIFEST, {status: STATUS_DISPATCH_PENDING});
          commit('pilotManifest/UPDATE_MANIFEST', {status: STATUS_DISPATCH_PENDING}, {root: true});
        }).finally(()=>commit(consts.SET_PENDING, false))
    },
    setManifest({ commit }, manifest) {
      commit(consts.SET_CONFIRMATION, manifest);
    },

    reset({ commit }) {
      commit(consts.RESET_CONFIRMATION);
    },
  },

  mutations: {
    [consts.RESET_CONFIRMATION](state) {
      state.manifest = {};
      state.comment = '';
      state.approvalData = {
        pin: '',
        initials: '',
        created: DateTime.utc().toFormat('yyyy-MM-dd')
      };
      state.pending = false;
    },

    [consts.SET_CONFIRMATION](state, manifest) {
      state.manifest = manifest;
    },

    [consts.SET_PENDING](state, status) {
      state.pending = status;
    },
    [consts.UPDATE_MANIFEST](state, data) {
      if (state.manifest && state.manifest.id) {
        state.manifest = {
          ...state.manifest,
          ...data,
        };
      }
    },
    [consts.UPDATE_APPROVAL_DATA](state, data) {
      state.approvalData = {
        ...state.approvalData,
        ...data,
      };
    }
  },
};
