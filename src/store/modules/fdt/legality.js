import { find } from 'lodash';
import legalityApi from '../../../api/fdt/legality';
import { generateDayMap } from '../../../utils/timeline';
import loaderMixin, { affectLoading } from 'store/helpers/loading';

const SET_LEGALITY = 'SET_LEGALITY';
export const CLEAR_LEGALITY = 'CLEAR_LEGAILTY';

export const SELECT_BLOCK_TIME = 'SELECT_BLOCK_TIME';
export const HOVER_BLOCK = 'HOVER_BLOCK';
export const ACTIVE_BLOCK = 'ACTIVE_BLOCK';
export const SET_ERRORS = 'SET_ERRORS';

export const SELECT_SHIFT = 'SELECT_SHIFT';
export const HOVER_SHIFT = 'HOVER_SHIFT';
export const ACTIVE_SHIFT = 'ACTIVE_SHIFT';

export const SET_CONFIRMED = 'SET_CONFIRMED';

export default loaderMixin({
  namespaced: true,

  state: {
    blockTimes: [],
    shifts: [],
    totals: {},

    confirmed: false,

    hoverBlockTime: null,
    activeBlockTime: null,
    hoverShift: null,
    activeShift: null,

    blockTime: {},
    shift: {},
  },

  getters: {
    activeBlockTime: state => find(state.blockTimes, { id: state.activeBlockTime }),
    activeShift: state => find(state.shifts, { id: state.activeShift }),

    blockTimes: state => state.blockTimes,
    shifts: state => state.shifts,
    totals: state => state.totals,

    confirmed: state => state.confirmed,
    pinning: state => state.pinng,
    showConfirmationForm: state => state.showConfirmationForm,

    dailyBlocks: (state, _g, _rs, rootGetters) => generateDayMap(
      state.blockTimes,
      rootGetters['fdt/calendar/date'],
    ),
    dailyShifts: (state, _g, _rs, rootGetters) => generateDayMap(
      state.shifts,
      rootGetters['fdt/calendar/date'],
    ),
  },

  actions: {
    @affectLoading
    async getLegality({ commit }, { pilot, clear = false, filters = {} }) {
      if (clear) {
        commit(CLEAR_LEGALITY);
      }

      const data = await legalityApi.fetchLegality(pilot, filters);
      return commit(SET_LEGALITY, data);
    },

    async confirm({ commit }, data) {
      await legalityApi.confirmFDT(data);
      commit(SET_CONFIRMED, true);
    },

    async reopen({ commit }, data) {
      await legalityApi.removeConfirm(data);
      commit(SET_CONFIRMED, false);
    },
  },

  mutations: {
    [SET_LEGALITY](state, legality) {
      state.blockTimes = legality.block_times;
      state.shifts = legality.shifts;
      state.totals = legality.totals;
      state.confirmed = legality.confirmed;
    },

    [CLEAR_LEGALITY](state) {
      state.blockTimes = [];
      state.shifts = [];
      state.totals = {};
      state.confirmed = false;
    },

    [SELECT_BLOCK_TIME](state, blockTime) {
      state.blockTime = blockTime;
    },
    [HOVER_BLOCK](state, hoverBlockTime) {
      state.hoverBlockTime = hoverBlockTime;
    },
    [ACTIVE_BLOCK](state, activeBlockTime) {
      state.activeBlockTime = activeBlockTime;
    },

    [SELECT_SHIFT](state, shift) {
      state.shift = shift;
    },
    [HOVER_SHIFT](state, shift) {
      state.hoverShift = shift;
    },
    [ACTIVE_SHIFT](state, shift) {
      state.activeShift = shift;
    },
    [SET_CONFIRMED](state, val) {
      state.confirmed = val;
    },
  },
});
