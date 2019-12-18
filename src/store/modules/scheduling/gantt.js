import { flatten } from 'lodash';
import { DateTime } from 'luxon';

import api from 'api/scheduling';
import * as consts from './consts';
import loadingMixin, { affectLoading } from '../../helpers/loading';


export const DEFAULT_RANGE_VALUE = 7; // days

const state = {
  range: DEFAULT_RANGE_VALUE,
  pilotList: [],
};

const getters = {
  formattedList(state) {
    return state.pilotList.map(row => ({
      id: row.pilot.id,
      name: `${row.pilot.first_name} ${row.pilot.last_name}`,
      base: row.pilot.base,
      shifts: row.schedule_records.filter(record => (record.duty_on && record.duty_off))
        .map(record => ({
          id: record.id,
          start: record.duty_on,
          end: record.duty_off,
          isScheduled: true,
        }))
        .concat(row.manifests.map(manifest => ({
          id: manifest.id,
          start: manifest.duty_on,
          end: manifest.duty_off,
          isScheduled: false,
        }))),
      blocks: flatten(row.schedule_records
        .filter(record => (record.flights !== undefined))
        .map(record => (record.flights.map(flight => ({
          id: flight.id,
          start: flight.datetime_out,
          end: flight.datetime_in,
          flight_number: flight.flight_number,
          isScheduled: true,
        }))))
        .concat(row.manifests.map(manifest => (manifest.logs.map(log => ({
          id: log.id,
          flight_id: log.flight_id,
          flight_number: log.flight_number,
          start: log.datetime_out,
          end: log.datetime_in,
          isScheduled: false,
        })))))),
    }));
  },

  filteredList(state, { formattedList }, rootState, rootGetters) {
    const pilotName = rootGetters['scheduling/calendar/filters/pilotName'];
    return formattedList.filter((row) => {
      if (!pilotName) return true;

      return row.name.toUpperCase()
        .indexOf(pilotName.toUpperCase()) > -1;
    });
  },
};

const actions = {
  @affectLoading
  async fetch({ commit }, { dates, filters }) {

    const pilotList = await api.getGanttData({
      ...filters,
      date_from: dates[0],
      date_to: dates[1],
    });
    commit(consts.SET_GANTT_PILOT_LIST, pilotList);
  },
};

const mutations = {
  [consts.SET_GANTT_PILOT_LIST](state, pilotList) {
    state.pilotList = pilotList;
  },
  [consts.CHANGE_RANGE](state, range) {
    state.range = range;
  },
};

export default loadingMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});
