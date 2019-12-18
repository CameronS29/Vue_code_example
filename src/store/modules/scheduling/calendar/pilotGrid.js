import nanoid from 'nanoid';
import Vue from 'vue';

import {
  filter, find, findIndex, uniq, omit,
  groupBy, keyBy, keys, mapValues,
  mergeWith, orderBy, sortBy, values,
} from 'lodash';
import api from 'api/scheduling';

import { DateTime } from 'luxon';
import * as consts from '../consts';
import loadingMixin, { affectLoading } from '../../../helpers/loading';

const dayGetter = ({ date }) => Number(date.slice(3, 5));


const state = {
  pilots: [],
  pilotPayroll: [],
  pendingPilotIds: {},
};

const getters = {
  pilots: state => state.pilots,
  filteredPilots: (state, getters, rootState) => {
    const { pilotName } = rootState.scheduling.calendar.filters;

    return pilotName.length
      ? state.pilots.filter(pilot => (
        `${pilot.pilot.first_name} ${pilot.pilot.last_name}`
          .toUpperCase()
          .indexOf(pilotName.toUpperCase()) > -1
      )) : state.pilots;
  },

  filteredPayroll: (state, getters, rootState) => {
    const { pilotName } = rootState.scheduling.calendar.filters;

    return pilotName.length
      ? state.pilotPayroll.filter(pilot => (
        `${pilot.first_name} ${pilot.last_name}`
          .toUpperCase()
          .indexOf(pilotName.toUpperCase()) > -1
      )) : state.pilotPayroll;
  },

  sortedPilots: (state, getters, rootState) => {
    const { sort } = rootState.scheduling.calendar;
    const { actual } = rootState.scheduling.calendar.filters;

    return sort.daySort
      ? sortBy(getters.filteredPilots, (pilot) => {
        const dayRecords = filter(
          actual ? pilot.manifests : pilot.schedule_records,
          record => DateTime.fromFormat(record.date, consts.LUXON_US_DATE_FORMAT).day === Math.abs(sort.daySort),
        );

        return sort.daySort > 0 ? -dayRecords.length : dayRecords.length;
      })
      : orderBy(getters.filteredPilots, keys(sort.sortBy), values(sort.sortBy));
  },

  pilotRecordMap: (state) => {
    const groupedByDay = state.pilots.map((pilot) => {
      const records = groupBy(pilot.schedule_records, dayGetter);
      const manifests = groupBy(pilot.manifests, dayGetter);

      const daySums = mergeWith(
        mapValues(records, 'length'),
        mapValues(manifests, 'length'),
        (a = 0, b = 0) => (a + b),
      );
      const maxLength = Math.max(...Object.values(daySums), 1);

      return {
        pilot: pilot.pilot,
        records,
        manifests,
        maxLength,
      };
    });

    return keyBy(groupedByDay, 'pilot.id');
  },

  isPilotPending: state => id => (id in state.pendingPilotIds),
  daysOffByPilotId: ({ pilots }) => (pilotId, dates) => {
    const pilot = find(pilots, ({ pilot }) => pilot.id === pilotId);
    if (!pilot) return [];

    return pilot.schedule_records
      .filter(record => dates.includes(record.date) && record.type === 'off');
  },

  illegalScheduledPilots: state => filter(state.pilots, pilot => !pilot.totals.is_legal),
};

const actions = {
  @affectLoading
  async fetch({ commit, rootGetters }) {
    const revision = rootGetters['scheduling/revisions/activeRevision'];
    const filters = rootGetters['scheduling/calendar/filters/apiFormat'];

    const pilots = await api.getPilotGrid(revision.id, filters);
    commit(consts.SET_PILOT_GRID, pilots);
  },

  @affectLoading
  async fetchPayroll({ commit, rootGetters }) {
    const revision = rootGetters['scheduling/revisions/activeRevision'];
    const filters = rootGetters['scheduling/calendar/filters/apiFormat'];

    const pilots = await api.getPilotPayroll(revision.id, filters);
    commit(consts.SET_PILOT_PAYROLL, pilots);
  },

  async updateRecords({ commit, rootGetters }, { pilots }) {
    const revision = rootGetters['scheduling/revisions/activeRevision'];
    const filters = {
      ...rootGetters['scheduling/calendar/filters/apiFormat'],
      pilot: uniq(filter(pilots)),
    };

    commit(consts.ADD_PENDING_PILOTS, pilots);
    try {
      const records = await api.getPilotGrid(revision.id, filters);
      commit(consts.UPDATE_RECORDS, records);
    } finally {
      commit(consts.REMOVE_PENDING_PILOTS, pilots);
    }
  },
};

const mutations = {
  [consts.SET_PILOT_GRID](state, gridData) {
    state.pilots = gridData;
  },

  [consts.SET_PILOT_PAYROLL](state, payrollData) {
    state.pilotPayroll = payrollData;
  },

  [consts.OPTIMISTIC_ADD_RECORD](state, { pilotId, record }) {
    state.pendingPilotIds[pilotId] = pilotId;
    const tableRow = find(state.pilots, { pilot: { id: pilotId } });
    if (tableRow === undefined) {
      return;
    }

    const recordList = filter(
      tableRow.schedule_records,
      rec => (rec.date !== record.date || rec.type !== consts.TYPE_OFF),
    );
    recordList.push({
      ...record,
      id: nanoid(),
      optimistic: true,
    });
    tableRow.schedule_records = recordList;
  },

  [consts.OPTIMISTIC_SET_OFF_RECORD](state, { pilotId, record }) {
    state.pendingPilotIds[pilotId] = pilotId;
    const row = find(state.pilots, { pilot: { id: pilotId } });
    if (row === undefined) {
      return;
    }

    const recordList = filter(
      row.schedule_records,
      rec => (rec.date !== record.date),
    );
    recordList.push({
      ...record,
      id: nanoid(),
      optimistic: true,
    });
    row.schedule_records = recordList;
  },

  [consts.OPTIMISTIC_REMOVE_RECORD](state, recordId) {
    const row = find(state.pilots, { schedule_records: [{ id: recordId }] });
    if (row === undefined) {
      return;
    }

    state.pendingPilotIds[row.pilot.id] = row.pilot.id;
    const records = row.schedule_records;
    const recIdx = findIndex(records, { id: recordId });
    records.splice(recIdx, 1);
  },

  [consts.ADD_PENDING_PILOTS](state, pilots) {
    pilots.forEach(id => Vue.set(state.pendingPilotIds, id, id));
  },

  [consts.REMOVE_PENDING_PILOTS](state, pilots) {
    pilots.forEach(id => Vue.delete(state.pendingPilotIds, id));
  },

  [consts.UPDATE_RECORDS](state, records) {
    records.forEach((record) => {
      const { pilot: { id } } = record;
      const recordIndex = findIndex(state.pilots, { pilot: { id } });
      Object.assign(state.pilots[recordIndex], omit(record, 'totals'));
    });
  },

  [consts.UPDATE_PILOT_TOTALS](state, { pilot: id, totals }) {
    const pilot = find(state.pilots, { pilot: { id } });
    pilot.totals = totals;
  },
};

export default loadingMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});

