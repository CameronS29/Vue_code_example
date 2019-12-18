import { DateTime } from 'luxon';
import { map, get, values, flatten } from 'lodash';

import loaderMixin, { affectLoading } from 'store/helpers/loading';
import filters from './filters';
import sort from './sort';
import pilotGrid from './pilotGrid';
import pairBinding from './pairBinding';
import history from './history';

import * as consts from '../consts';
import api from '../../../../api/scheduling';

export const activeRevisionPath = 'scheduling/revisions/activeRevision';
const pilotGridNs = action => (`scheduling/calendar/pilotGrid/${action}`);

const state = {
  year: DateTime.local().year,
  month: DateTime.local().month,

  showAssignedFlightsDate: null,
  showFDTCalendarPilot: null,
  showManifestId: null,
  highlightedPilotId: null,

  isPilotView: false,
  isInPayrollMode: false,
};

const getters = {
  date: ({ year, month }) => DateTime.fromObject({ year, month }),
  UTCDate: ({ year, month }) => DateTime.fromObject({ year, month }).setZone('UTC', { keepLocalTime: true }),
  daysInMonth: ({ year, month }) => DateTime.fromObject({ year, month }).daysInMonth,
  formattedUTCDate: (state, { UTCDate }) => UTCDate.toFormat('LLL yyyy'),
  monthString: state => DateTime.fromObject({ month: state.month }).toFormat('LLLL'),
};

const actions = {
  @affectLoading
  bindPairings(_, assignData) {
    return api.multiAddRecords(assignData);
  },

  @affectLoading
  bindShift({ commit, rootGetters }, { shift, pilotId }) {
    const date = DateTime.fromISO(shift.duty_on).setZone(0).toISODate();
    const revision = rootGetters[activeRevisionPath];
    const record = {
      date,
      pair: shift.name,
      revision: revision.id,
      type: consts.TYPE_SHIFT,
    };
    const payload = { pilotId, record };

    commit(pilotGridNs(consts.OPTIMISTIC_ADD_RECORD), payload, { root: true });
    return api.postRecord({
      date,
      pilot_id: pilotId,
      unpaired_shift_id: shift.id,
      revision: revision.id,
      type: consts.TYPE_SHIFT,
    });
  },

  @affectLoading
  deleteRecord({ commit }, pairingId) {
    commit(pilotGridNs(consts.OPTIMISTIC_REMOVE_RECORD), pairingId, { root: true });
    return api.deleteRecord(pairingId);
  },

  @affectLoading
  /**
   * Removes PIC or SIC from record (record.pilot or record.sic)
   * @returns {*|Promise<*>}
   */
  deleteRecordPart(_ctx, { record, type }) {
    return api.patchRecord(record.id, {
      pilot_id: type === consts.PIC_RANK_ID ? null : record.pilot.id,
      sic_id: type === consts.SIC_RANK_ID ? null : record.sic.id,
    });
  },

  @affectLoading
  bindDayOFF({ commit, dispatch, getters, rootGetters }, {
    date, pilotId, type, comments,
  }) {
    const revision = rootGetters[activeRevisionPath];

    if (date) {
      const record = {
        pilot_id: pilotId,
        revision: revision.id,
        type: consts.TYPE_OFF,
        off_reason_id: type.id,
        shortcut: type.abbr,
        date,
        comments,
      };
      const payload = { pilotId, record };

      commit(pilotGridNs(consts.OPTIMISTIC_SET_OFF_RECORD), payload, { root: true });
      dispatch('removePaidOffs', [date]);
      return api.postRecord(record);
    }
    const payload = {
      pilot: pilotId,
      dates: getters['pairBinding/dateRangeDates'],
      off_reason: type.id,
      comments,
    };

    dispatch('removePaidOffs', getters['pairBinding/dateRangeDates']);
    return api.dayOffMultiAssign(revision.id, [payload]);
  },

  @affectLoading
  async removeRecordsInSelectedRange({ state, getters }) {
    const { pilotId } = state.pairBinding;
    const formattedDatesInRange = getters['pairBinding/dateRangeDates'].map(date => DateTime.fromISO(date)
      .toFormat(consts.LUXON_US_DATE_FORMAT));
    const wholeMonthRecords = getters['pilotGrid/pilotRecordMap'][pilotId].records;
    const recordsInSelectedRange = flatten(values(wholeMonthRecords))
      .filter(record => formattedDatesInRange.indexOf(record.date) > -1);

    const pics = map(recordsInSelectedRange, 'pilot');
    const sics = map(recordsInSelectedRange, 'sic');

    await api.multiRemoveRecords(recordsInSelectedRange.map(record => ({ id: record.id, pilot: pilotId })));
    return [...pics, ...sics];
  },

  async paidOffAssign({ state, rootGetters }, { dates, type }) {
    const revision = rootGetters[activeRevisionPath].id;
    const pilot = state.pairBinding.pilotId;

    return api.paidOffAssign({
      revision,
      payload: dates.map(date => ({
        pilot,
        date,
        type,
      })),
    });
  },

  @affectLoading
  async addPaidOffs({ dispatch }, dates) {
    return dispatch('paidOffAssign', { dates, type: 1 });
  },

  @affectLoading
  async removePaidOffs({ dispatch }, dates) {
    return dispatch('paidOffAssign', { dates, type: 2 });
  },

  async sickDayAssign({ state, rootGetters }, { records, action }) {
    const revision = rootGetters[activeRevisionPath].id;
    const pilot = state.pairBinding.pilotId;

    return api.sickAssign({
      revision,
      payload: records.map(({ date, type }) => ({
        pilot,
        date,
        type,
        action,
      })),
    });
  },

  @affectLoading
  async addSickDay({ dispatch }, records) {
    return dispatch('sickDayAssign', { records, action: 1 });
  },

  @affectLoading
  async removeSickDay({ dispatch }, records) {
    return dispatch('sickDayAssign', { records, action: 2 });
  },
};

const mutations = {
  [consts.CHANGE_DATE](state, date) {
    const { year, month } = DateTime.fromJSDate(date);
    Object.assign(state, { year, month });
  },

  [consts.INC_PROGRESS](state) {
    state.progress += 1;
  },

  [consts.DEC_PROGRESS](state) {
    state.progress -= 1;
  },

  [consts.SET_SHOW_ASSIGNED_FLIGHTS_DATE](state, date) {
    state.showAssignedFlightsDate = date;
    state.showFDTCalendarPilot = null;
    state.showManifestId = null;
  },

  [consts.SET_SHOW_FDT_CALENDAR_PILOT](state, pilot) {
    state.showAssignedFlightsDate = null;
    state.showFDTCalendarPilot = pilot;
    state.showManifestId = null;
  },

  [consts.SET_SHOW_MANIFEST_ID](state, manifestId) {
    state.showAssignedFlightsDate = null;
    state.showFDTCalendarPilot = null;
    state.showManifestId = manifestId;
  },

  [consts.SET_PILOT_VIEW](state, flag) {
    state.isPilotView = flag;
  },

  [consts.SET_HIGHLIGHTED_PILOT](state, pilotId) {
    state.highlightedPilotId = pilotId;
  },

  [consts.SET_PAYROLL_MODE](state, flag) {
    state.isInPayrollMode = flag;
  },
};

export default loaderMixin({
  namespaced: true,

  state,
  getters,
  actions,
  mutations,

  modules: {
    filters,
    sort,
    pilotGrid,
    pairBinding,
    history,
  },
});
