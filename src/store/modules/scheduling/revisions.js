import { sortBy, keyBy, last, find, filter, isEmpty } from 'lodash';

import loaderMixin, { affectLoading } from 'store/helpers/loading';
import api from 'api/scheduling';
import * as consts from 'store/modules/scheduling/consts';

export const checkLegality = id => api.checkRevisionLegality(id);

const state = {
  activeRevisionId: undefined,
  revisions: [],
  affect: null,
  hasChanges: false,
  newlyCreatedFirstDraft: null,
};

const getters = {
  hasRevisions: state => state.revisions.length > 0,
  sortedRevisions: state => sortBy(state.revisions, ['version']),
  sortedPublished: state => filter(sortBy(state.revisions, ['version']), 'published'),
  activePublished: (state, getters) => getters.activeRevision.published,
  draftExists: state => find(state.revisions, { published: false }) !== undefined,
  hasInitial: state => find(state.revisions, { initial: true }) !== undefined,
  lastRevision: (state, getters) => last(getters.sortedRevisions),
  lastPublished: (state, getters) => last(getters.sortedPublished),
  activeRevision: (state, getters) => (state.activeRevisionId === undefined
    ? (last(getters.sortedRevisions) || {})
    : (find(getters.sortedRevisions, { id: state.activeRevisionId }) || last(getters.sortedRevisions) || {})
  ),
  byId: state => keyBy(state.revisions, 'id'),
  isAffectedFlightsExists: (state) => {
    if (!state.affect) return false;
    return !isEmpty(state.affect.pairs) || !isEmpty(state.affect.shifts);
  },
};

const actions = {
  @affectLoading
  async getRevisions({ commit, getters, rootState }, { year, month }) {
    let revisions = await api.getRevisions({ year, month });
    if (!revisions.length) {
      const revision = await api.createRevision({ year, month });
      revisions = [revision];
    }

    commit(consts.SET_REVISIONS, revisions);
    if (rootState.scheduling.calendar.isPilotView && getters.lastPublished) {
      commit(consts.SET_ACTIVE_REVISION, getters.lastPublished.id);
    }
  },

  @affectLoading
  async publishActiveRevision({ commit, getters }) {
    await api.publishRevision(getters.activeRevision);
    commit(consts.PUBLISH_REVISION, getters.activeRevision);
  },

  @affectLoading
  async createRevision({ commit, dispatch }, params) {
    const revision = await api.createRevision(params);
    commit(consts.ADD_REVISION, revision);
    commit(consts.SET_ACTIVE_REVISION, revision.id);
    return dispatch('getRevisionHasChanges');
  },

  async getRevisionHasChanges({ commit, getters }) {
    const { id } = getters.activeRevision;
    const { upgrade_needed: hasChanges } = await api.getRevisionHasChanges(id);
    commit(consts.SET_REVISION_HAS_CHANGES, hasChanges);
  },

  @affectLoading
  async getAffect({ commit }, revisionId) {
    const affect = await api.getRevisionAffect(revisionId);
    commit(consts.SET_AFFECT, affect);
  },

  @affectLoading
  async removeDraft({
    commit, state, dispatch, getters,
  }) {
    const {
      id, year,
      month, published,
    } = getters.activeRevision;
    if (published) return;

    await api.removeRevision(id);
    if (state.revisions.length < 2) {
      await dispatch('createRevision', { year, month });
      commit(consts.SET_NEWLY_CREATED_FIRST_DRAFT, state.revisions[1]);
    }

    commit(consts.REMOVE_REVISION, id);
  },

  @affectLoading
  async setInitialMonthRevision({ dispatch }, { id, year, month }) {
    await api.setInitialMonthRevision(id);
    dispatch('getRevisions', { year, month });
  },

  @affectLoading
  async unsetInitialMonthRevision({ dispatch }, { id, year, month }) {
    await api.unsetInitialMonthRevision(id);
    dispatch('getRevisions', { year, month });
  },
};

const mutations = {
  [consts.SET_REVISIONS](state, revisions) {
    state.revisions = revisions;
  },
  [consts.ADD_REVISION](state, revision) {
    state.revisions.push(revision);
  },
  [consts.REMOVE_REVISION](state, id) {
    state.revisions = state.revisions.filter(revision => revision.id !== id);

    if (id === state.activeRevisionId) {
      state.activeRevisionId = state.revisions.length
        ? last(sortBy(state.revisions, ['version'])).id
        : undefined;
    }
  },
  [consts.SET_ACTIVE_REVISION](state, revisionId) {
    state.activeRevisionId = revisionId;
    state.hasChanges = false;
  },
  [consts.PUBLISH_REVISION](state, revision) {
    Object.assign(revision, { published: true });
  },
  [consts.SET_AFFECT](state, affect) {
    state.affect = affect;
  },
  [consts.SET_NEWLY_CREATED_FIRST_DRAFT](state, revision) {
    state.newlyCreatedFirstDraft = revision;
  },
  [consts.SET_REVISION_HAS_CHANGES](state, hasChanges) {
    state.hasChanges = hasChanges;
  },
};

export default loaderMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});
