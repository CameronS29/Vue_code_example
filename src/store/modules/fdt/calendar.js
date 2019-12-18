import { DateTime } from 'luxon';
import { find, pickBy } from 'lodash';
import loaderMixin, { affectLoading } from 'store/helpers/loading';

export const SET_ACTUAL = 'SET_ACTUAL';
export const SET_REVISION = 'SET_REVISION';
export const SET_DATE = 'SET_DATE';
export const SET_SHOW_DUTY_FORM = 'SET_SHOW_DUTY_FORM';
export const SET_SANDBOX = 'SET_SANDBOX';

const revisionsNamespace = (prop = '') => (`scheduling/revisions/${prop}`);

export default loaderMixin({
  namespaced: true,

  state: {
    date: DateTime.local().setZone('UTC'),
    revisionId: undefined,
    isActual: true,
    sandbox: undefined,
    showDutyForm: false,
  },

  getters: {
    date: ({ date }) => date.plus({ days: 2 }),
    localDate: (_, { date }) => date.setZone('local'),

    month: (_, { localDate }) => localDate.month,
    year: (_, { localDate }) => localDate.year,
    tz: ({ date }) => date.zoneName,

    hasActualDate: (_, { localDate }) => (
      DateTime.local().diff(localDate).as('hours') > 0
    ),

    scheduleType({ revisionId, isActual, sandbox }, getters, _rs, rootGetters) {
      const revisions = rootGetters[revisionsNamespace('sortedRevisions')];

      const activeRevision = find(revisions, { id: revisionId });
      return {
        revision: (activeRevision || {}).id,
        actual: isActual,
        sandbox,
      };
    },

    dutyFilters: (_, { scheduleType, year, month }) => pickBy({
      year,
      month,
      ...scheduleType,
    }),

    isOnPublishedRevision(state, getters, rootState, rootGetters) {
      if (!state.revisionId) return false;

      const revision = rootGetters['scheduling/revisions/byId'][state.revisionId];
      return revision !== undefined ? revision.published : false;
    },
  },

  actions: {
    @affectLoading
    async getLegality({ dispatch, getters, rootState }, clear = true) {
      const pilot = rootState.pilots.pilot.id;
      if (!pilot || !getters.date.isValid) {
        return Promise.resolve();
      }

      const actionParams = { pilot, clear, filters: getters.dutyFilters };
      return dispatch('fdt/legality/getLegality', actionParams, { root: true });
    },

    @affectLoading
    async setPilot({ dispatch }, pilot) {
      await dispatch('pilots/selectPilot', pilot, { root: true });
      return dispatch('getLegality');
    },

    @affectLoading
    async setDate({ commit, dispatch, getters, rootGetters }, { date, resetRevision = true } = {}) {
      const dt = date.setZone(getters.tz);
      commit(SET_DATE, dt);
      if (resetRevision) {
        commit(SET_REVISION, undefined);
      }

      const action = revisionsNamespace('getRevisions');
      await dispatch(action, getters.localDate, { root: true });
      await dispatch('setRevision', rootGetters[revisionsNamespace('lastRevision')].id);
    },

    async setRevision({ commit, dispatch }, revisionId) {
      commit(SET_REVISION, revisionId);
      return dispatch('getLegality');
    },

    async setActual({ commit, dispatch }, isActual) {
      commit(SET_ACTUAL, isActual);
      return dispatch('getLegality');
    },

    setTimezone({ commit, state: { date } }, tz) {
      commit(SET_DATE, date.setZone(tz));
    },
  },

  mutations: {
    [SET_DATE](state, date) {
      state.date = date;
    },
    [SET_REVISION](state, revisionId) {
      state.revisionId = revisionId;
    },
    [SET_ACTUAL](state, isActual) {
      state.isActual = isActual;
    },
    [SET_SHOW_DUTY_FORM](state, isShown) {
      state.showDutyForm = isShown;
    },
    [SET_SANDBOX](state, isSandbox) {
      state.sandbox = isSandbox;
    },
  },
});
