import { find } from 'lodash';
import * as consts from 'store/modules/scheduling/consts';

const state = {
  draftRevisionId: null,
  draftAdditionPopupShown: false,
};

const getters = {
  draftRevision(state, getters, rootState) {
    return find(rootState.scheduling.revisions.revisions, { id: state.draftRevisionId });
  },
};

const actions = {};

const mutations = {
  [consts.SET_DRAFT_REVISION](state, draftRevisionId) {
    state.draftRevisionId = draftRevisionId;
  },
  [consts.SET_DRAFT_ADDITION_POPUP_SHOWN](state, flag) {
    state.draftAdditionPopupShown = flag;
  },
};

export default {
  namespaced: true,

  state,
  getters,
  actions,
  mutations,

  modules: {},
};
