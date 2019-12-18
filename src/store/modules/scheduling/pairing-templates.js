import parse from 'date-fns/parse';
import {
  filter, find, findIndex,
  get, isEqual, keyBy,
  map, omit, matches,
  sortBy, uniqWith, uniqBy,
  flatten, zipObject,
} from 'lodash';

import update from 'immutability-helper';
import { getFlightListByTemplate } from 'utils/flights';

import loadingMixin, { affectLoading } from 'store/helpers/loading';
import createTableStore from '../../factory/table';
import * as consts from './consts';

import api, { pairingTemplateGroups } from '../../../api/scheduling';
import off from './off';
import reserve from './templates/reserve';
import holidays from './templates/holidays';

const baseDate = new Date(0);
const tableModule = 'table';
export const tableNamespace = `scheduling/pairingTemplates/${tableModule}`;


const getFlightData = ({ flight_number, origin, destination }, params = {}) => ({
  flight_number,
  origin,
  destination,
  ...params,
});


const state = {
  editablePairingTemplateGroupId: null,
  editablePairingTemplateFilterByFlightIds: {},
  editablePairingTemplateGroupTemplates: [],
  editablePairingTemplateId: null,
  activeTabIndex: 0,
  collisions: [],
  affect: [],
  showAffect: false,
  affectLoading: false,
  affectTemplateId: null,

  plainGroups: [],
  groupEditForm: {},
};


const getters = {
  tabNameByTabIndex() {
    return tabIndex => consts.TABS[tabIndex];
  },

  reserveTypeIdByTabIndex() {
    return tabIndex => consts.TAB_ID_RESERVE_ID_MAP[tabIndex];
  },

  activeTabName(state, getters) {
    return getters.tabNameByTabIndex(state.activeTabIndex);
  },

  activeReserveTypeId(state, getters) {
    return getters.reserveTypeIdByTabIndex(state.activeTabIndex);
  },

  flightNumberMap(state, getters) {
    const flights = get(getters.editablePairingTemplate, 'flights', []);
    return keyBy(filter(flights, ({ next_day }) => (next_day !== true)));
  },

  tomorrowFlightNumberMap(state, getters) {
    const flights = get(getters.editablePairingTemplate, 'flights', []);
    return keyBy(filter(flights, { next_day: true }));
  },

  editablePairingTemplateGroup(state) {
    const groupsTableResults = state[tableModule].results;
    return find(
      groupsTableResults,
      { id: state.editablePairingTemplateGroupId },
    );
  },

  activeGroupIntervals(state, getters) {
    const activeTemplateId = state.editablePairingTemplateId;
    const excludedTemplates = filter(
      getters.sortedEditablePairingTemplateGroupTemplates,
      ({ id, start_date, end_date }) => (
        id !== activeTemplateId
        && start_date !== null
        && end_date !== null
      ),
    );

    return map(excludedTemplates, ({ start_date, end_date }) => {
      const start = parse(start_date, consts.FNS_US_DATE_FORMAT, baseDate);
      const end = parse(end_date, consts.FNS_US_DATE_FORMAT, baseDate);
      return { start, end };
    });
  },

  editablePairingTemplate(state) {
    return find(
      state.editablePairingTemplateGroupTemplates,
      { id: state.editablePairingTemplateId },
    );
  },

  filterByFlights(state, getters) {
    if (!getters.editablePairingTemplate) {
      return [];
    }
    return filter(
      getFlightListByTemplate(getters.editablePairingTemplate),
      ({ id }) => (state.editablePairingTemplateFilterByFlightIds[id] !== undefined),
    );
  },

  sortedEditablePairingTemplateGroupTemplates(state) {
    return sortBy(
      state.editablePairingTemplateGroupTemplates,
      (template) => {
        if (!template.start_date) {
          return 0;
        }
        return parse(
          template.start_date,
          consts.FNS_US_DATE_FORMAT,
          baseDate,
        ).valueOf();
      },
    );
  },

  isCollisionsExists(state) {
    return !!state.collisions.length;
  },

  intersectedShellNames(state) {
    const shells = flatten(map(state.collisions, 'shells'));
    const names = map(shells, 'name');
    return zipObject(names, names);
  },

  affectedFlights(state) {
    const addedPairs = filter(state.affect, change => change.added_flights !== null);
    const deletedPairs = filter(state.affect, change => change.deleted_flights !== null);

    const addedFlights = uniqBy(flatten(map(addedPairs, 'added_flights')), 'id');
    const deletedFlights = uniqBy(flatten(map(deletedPairs, 'deleted_flights')), 'id');

    return { addedFlights, deletedFlights };
  },

  plainGroups: state => state.plainGroups,
  showGroupForm: state => state.groupEditForm.id !== undefined,
};

const actions = {
  @affectLoading
  async getPairingTemplates({ commit }, groupId) {
    const templates = await api.pairingTemplatesByGroupId(groupId);
    commit(consts.CHANGE_EDITABLE_PAIRING_TEMPLATE_GROUP_TEMPLATES, templates);
  },

  async getPairingTemplateAffect({ commit }, templateId) {
    commit(consts.SET_AFFECT_LOADING, true);
    commit(consts.SET_AFFECT, []);

    try {
      const affect = await api.pairingTemplateAffect(templateId);
      commit(consts.SET_AFFECT, affect);
      commit(consts.SET_AFFECT_TEMPLATE_ID, templateId);
    } finally {
      commit(consts.SET_AFFECT_LOADING, false);
    }
  },

  async addPairingTemplateGroup(_, name) {
    return api.addPairingTemplateGroup(name);
  },

  async applyPairingTemplate(_, id) {
    return api.applyPairingTemplate(id);
  },

  @affectLoading
  async updatePairingTemplateGroup({ state }) {
    const groupId = state.editablePairingTemplateGroupId;
    const { name, next_group } = state.groupEditForm;
    return api.updatePairingTemplateGroup(groupId, { name, next_group });
  },

  async removePairingTemplate(_, pairingTemplateId) {
    await api.removePairingTemplate(pairingTemplateId);
  },

  async addPairingTemplate({ state }, { startDate, endDate }) {
    const groupId = state.editablePairingTemplateGroupId;
    return api.addPairingTemplate({ groupId, startDate, endDate });
  },

  async patchEditablePairingTemplateFlights({ commit, dispatch, getters }) {
    const pairingTemplate = getters.editablePairingTemplate;
    const shell = await api.patchFlightsAtPairingTemplate(pairingTemplate);

    const activeGroup = getters.editablePairingTemplateGroup;
    commit(consts.UPDATE_SHELL, { group: activeGroup, shell });
    dispatch('getCollisions');
  },

  @affectLoading
  async patchEditablePairingTemplate({ commit, dispatch, getters }, payload) {
    const pairingTemplate = getters.editablePairingTemplate;

    commit(consts.UPDATE_PAIRING_TEMPLATE, { pairingTemplate, payload });
    const shell = await api.changePairingTemplate({ id: pairingTemplate.id, payload });

    const activeGroup = getters.editablePairingTemplateGroup;
    commit(consts.UPDATE_SHELL, { group: activeGroup, shell });
    dispatch('getCollisions');
  },

  async getCollisions({ commit }) {
    const collisions = await api.getCollisions();
    commit(consts.SET_COLLISIONS, collisions);
  },

  async listPlainGroups({ commit }, { name } = {}) {
    const groups = await api.listPlainGroups({ name });
    commit(consts.SET_PLAIN_GROUP_LIST, groups);
  },
};

const mutations = {
  [consts.CHANGE_EDITABLE_PAIRING_TEMPLATE_GROUP](state, id) {
    state.editablePairingTemplateGroupId = id;
  },

  [consts.HIDE_AFFECT](state) {
    state.showAffect = false;
  },

  [consts.SHOW_AFFECT](state, id) {
    state.showAffect = id;
  },

  [consts.ADD_FILTER_BY_FLIGHT_ID](state, id) {
    state.editablePairingTemplateFilterByFlightIds = {
      ...state.editablePairingTemplateFilterByFlightIds,
      [id]: id,
    };
  },

  [consts.REMOVE_FILTER_BY_FLIGHT_ID](state, id) {
    state.editablePairingTemplateFilterByFlightIds = omit(
      state.editablePairingTemplateFilterByFlightIds,
      id,
    );
  },

  [consts.CHANGE_EDITABLE_PAIRING_TEMPLATE_GROUP_TEMPLATES](state, templates) {
    state.editablePairingTemplateGroupTemplates = templates;
  },

  [consts.CHANGE_EDITABLE_PAIRING_TEMPLATE](state, id) {
    state.editablePairingTemplateId = id;
    state.editablePairingTemplateFilterByFlightIds = {};
  },

  [consts.ADD_FLIGHT_TO_PAIRING_TEMPLATE](state, { pairingTemplate, flight }) {
    const { flights } = pairingTemplate;
    pairingTemplate.flights = uniqWith([...flights, getFlightData(flight)], isEqual);
    pairingTemplate.distinct_flights.push(flight);
  },

  [consts.ADD_NEXT_DAY_FLIGHT_TO_PAIRING_TEMPLATE](state, { pairingTemplate, flight }) {
    const { flights } = pairingTemplate;
    const flightData = getFlightData(flight, { next_day: true });

    pairingTemplate.flights = uniqWith([...flights, flightData], isEqual);
    pairingTemplate.distinct_flights.push(flight);
  },

  [consts.REMOVE_FLIGHT_FROM_PAIRING_TEMPLATE](state, { pairingTemplate, flight }) {
    const { flights, distinct_flights } = pairingTemplate;
    const nextDay = (flight.isNextDayFlight ? { next_day: true } : {});

    const match = matches(getFlightData(flight, nextDay));
    pairingTemplate.flights = filter(flights, flight => !match(flight));
    pairingTemplate.distinct_flights = filter(distinct_flights, flight => !match(flight));
  },

  [consts.UPDATE_PAIRING_TEMPLATE](state, { pairingTemplate, payload = {} }) {
    if (pairingTemplate !== undefined) {
      Object.assign(pairingTemplate, payload);
    }
  },

  [consts.UPDATE_SHELL](state, { group, shell }) {
    const templateIndex = findIndex(state.editablePairingTemplateGroupTemplates, { id: shell.id });
    state.editablePairingTemplateGroupTemplates = update(
      state.editablePairingTemplateGroupTemplates,
      { [templateIndex]: { $set: shell } },
    );

    if (!group.last_shell || get(group.last_shell, 'id') === shell.id) {
      const groupIndex = findIndex(state[tableModule].results, group);

      state[tableModule].results = update(
        state[tableModule].results,
        { [groupIndex]: { $merge: { last_shell: shell } } },
      );
    }
  },

  [consts.SET_ACTIVE_TAB_INDEX](state, activeTabIndex) {
    state.activeTabIndex = activeTabIndex;
  },

  [consts.SET_AFFECT](state, affect) {
    state.affect = affect;
  },

  [consts.SET_COLLISIONS](state, collisions) {
    state.collisions = collisions;
  },
  [consts.SET_AFFECT_LOADING](state, loading) {
    state.affectLoading = loading;
  },
  [consts.SET_AFFECT_TEMPLATE_ID](state, id) {
    state.affectTemplateId = id;
  },

  [consts.SET_EDITABLE_GROUP_FORM](state, payload) {
    state.groupEditForm = payload;
  },
  [consts.SET_PLAIN_GROUP_LIST](state, groups) {
    state.plainGroups = groups;
  },
};

export default loadingMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
  modules: {
    off,
    reserve,
    holidays,
    [tableModule]: createTableStore(pairingTemplateGroups),
  },
});
