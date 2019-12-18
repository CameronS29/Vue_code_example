import { map, sortBy, last, find, keyBy, pickBy, flatten, values, groupBy } from 'lodash';
import { DateTime } from 'luxon';
import * as consts from './consts';

import loaderMixin, { affectLoading } from 'store/helpers/loading';
import api from '../../../api/scheduling';
import timezones from '../../../components/FDT/utils/timezones';

const activeRevisionPath = 'scheduling/revisions/activeRevision';
const actualSchedulePath = 'scheduling/calendar/filters/isActual';
const showActualPath = 'scheduling/calendar/filters/showActual';
const INITIAL_TIMEZONE_INDEX = 6;

const state = {
  assignedFlights: {},
  assignedPairs: {},
  assignedFlightStatus: {},
  timezone: timezones[INITIAL_TIMEZONE_INDEX][1],
};

const getters = {
  flightCount: state => flatten(values(state.assignedFlights)).length,
  pairCount: state => flatten(values(state.assignedPairs)).length,
  baseGroupedPairs: state => ({
    unassigned: groupBy(state.assignedPairs.unassigned, 'base'),
    pic_missing: groupBy(state.assignedPairs.pic_missing, 'base'),
    sic_missing: groupBy(state.assignedPairs.sic_missing, 'base'),
    assigned: groupBy(state.assignedPairs.assigned, 'base'),
  }),
};

const actions = {
  @affectLoading
  async getAssignedFlightStatus({ commit, rootGetters }) {
    const revision = rootGetters[activeRevisionPath].id;
    const actual = rootGetters[showActualPath] && rootGetters[actualSchedulePath];

    const filters = pickBy({ revision, actual });
    const assignedFlightStatus = await api.getAssignedFlightStatus(filters);
    commit(consts.SET_ASSIGNED_FLIGHT_STATUS, assignedFlightStatus);
  },

  @affectLoading
  async getAssignedFlights({ commit, state, rootGetters }, date) {
    const revision = rootGetters[activeRevisionPath].id;
    const actual = rootGetters[actualSchedulePath];

    const filters = pickBy({
      date: DateTime.fromISO(date, { zone: state.timezone }).toISO(),
      revision,
      actual,
    });
    const assignedFlights = await api.getAssignedFlights(filters);
    commit(consts.SET_ASSIGNED_FLIGHTS, assignedFlights);
  },

  @affectLoading
  async getAssignedPairs({ commit, rootGetters }, date) {
    const revision = rootGetters[activeRevisionPath].id;
    const actual = rootGetters[actualSchedulePath];

    const filters = pickBy({
      date,
      revision,
      actual,
    });
    const assignedFlights = await api.getAssignedPairs(filters);
    commit(consts.SET_ASSIGNED_PAIRS, assignedFlights);
  },
};

const mutations = {
  [consts.SET_ASSIGNED_FLIGHT_STATUS](state, payload) {
    state.assignedFlightStatus = keyBy(payload);
  },
  [consts.SET_ASSIGNED_FLIGHTS](state, payload) {
    state.assignedFlights = payload;
  },
  [consts.SET_ASSIGNED_PAIRS](state, payload) {
    state.assignedPairs = payload;
  },
  [consts.SET_TIMEZONE](state, timezone) {
    state.timezone = timezone;
  },
};

export default loaderMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});
