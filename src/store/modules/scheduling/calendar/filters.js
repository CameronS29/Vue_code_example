import { pickBy } from 'lodash';
import { DateTime } from 'luxon';
import qs from 'query-string';
import {
  CHANGE_RANK,
  CHANGE_BASE_AIRPORTS,
  CHANGE_AIRCRAFT_TYPE,
  CHANGE_ACTUAL,
  CHANGE_NEW_HIRES,
  CHANGE_PILOT_NAME,
} from '../consts';
import { SCHEDULING_API_BASE } from 'api/scheduling';

const state = {
  rank: undefined,
  baseAirportIds: undefined,
  aircraftTypeId: undefined,
  actual: true,
  newHires: false,

  pilotName: '',
};

const getters = {
  rank: state => state.rank,
  isActual: state => state.actual,
  showActual(_s, _g, _rs, rootGetters) {
    const revision = rootGetters['scheduling/revisions/activeRevision'];
    return DateTime.fromObject(revision) <= DateTime.local();
  },
  baseAirportIds: state => state.baseAirportIds,
  aircraftTypeId: state => state.aircraftTypeId,
  pilotName: state => state.pilotName,
  apiFormat: (state, getters) => pickBy({
    rank: state.rank,
    base: state.baseAirportIds,
    actual: getters.showActual && state.actual,
    new_hires: state.newHires,
  }),

  payrollCSVLink: (_s, { apiFormat }, _rs, rootGetters) => {
    const revision = rootGetters['scheduling/revisions/activeRevision'];

    if (!revision) return false;
    const filters = {
      ...apiFormat,
      format: 'csv',
    };

    return `${SCHEDULING_API_BASE}/payroll/${revision.id}/?${qs.stringify(filters)}`;
  },
};

const actions = {
};

const mutations = {
  [CHANGE_ACTUAL](state, isActual) {
    state.actual = isActual;
  },
  [CHANGE_RANK](state, rank) {
    state.rank = rank;
  },
  [CHANGE_BASE_AIRPORTS](state, baseAirportIds) {
    state.baseAirportIds = baseAirportIds;
  },
  [CHANGE_AIRCRAFT_TYPE](state, aircraftTypeId) {
    state.aircraftTypeId = aircraftTypeId;
  },
  [CHANGE_NEW_HIRES](state, value) {
    state.newHires = value;
  },
  [CHANGE_PILOT_NAME](state, value) {
    state.pilotName = value;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
