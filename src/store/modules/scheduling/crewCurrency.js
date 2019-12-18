import { find, findIndex, groupBy, pickBy, sortBy } from 'lodash';
import { crewCurrency as api } from 'api/scheduling';
import update from 'immutability-helper';

export const CURRENCY_PERIOD = 0;
export const CURRENCY_BOOLEAN = 1;
export const CURRENCY_VARIATIVE = 2;
export const CURRENCY_PERIODIC = 3;
export const CURRENCY_BOOL_CONNECTED = 4;
export const CURRENCY_NUMERIC = 5;

export const EXP_LAST_DAY = 0;
export const EXP_NEXT_MONTH = 1;
export const EXP_EXACT_DAY = 2;
export const UNIT_DAY = 0;
export const UNIT_MONTH = 1;
export const UNIT_YEAR = 2;
export const UNIT_PLAIN = 3;
export const THRESHOLD_OK = 3;
export const THRESHOLD_NEAR = 2;
export const THRESHOLD_GRACE = 1;
export const THRESHOLD_CRITICAL = 0;
export const DEFAULT_ENABLED_GROUP_IDS = [1, 2];

export const UNIT_NAMES = {
  [UNIT_DAY]: 'days',
  [UNIT_MONTH]: 'months',
  [UNIT_YEAR]: 'years',
};

const CATEGORY_TYPE_KEY = 'category';

const state = {
  pilots: [],
  types: [],
  typeGroups: [],

  editPopover: {
    pilotId: null,
    key: null,
  },
};

const getters = {
  pilots: state => sortBy(state.pilots, 'name'),
  types: state => state.types.filter(type => type.currency_meta.key_name !== CATEGORY_TYPE_KEY),
  typeById: state => id => find(state.types, { id }),
  typeByCurrencyId: state => id => find(state.types, type => type.currency_meta.id === id),
  categoryType: state => find(state.types, type => type.currency_meta.key_name === CATEGORY_TYPE_KEY),
  groupedTypes: (state) => {
    const groupedTypes = groupBy(state.types, 'group');

    return state.typeGroups.map(group => ({
      group,
      types: groupedTypes[group.id],
    }))
      .filter(group => group.types);
  },
};

const actions = {
  async fetch({ commit, state, rootGetters }) {
    const pilots = await api.fetch();

    commit('setPilots', pilots.filter(pilot => pilot.pilot));
  },
  async fetchTypes({ commit, state, rootGetters }) {
    const types = await api.fetchTypes();

    commit('setTypes', types.map(type => ({
      ...type,
      enabled: true,
    })));
  },
  async fetchGroups({ commit, state, rootGetters }) {
    const groups = await api.fetchGroups();

    commit('setGroups', groups);
  },
  async patchProp({ commit, state, rootGetters }, { pilotId, key, value }) {
    commit('patchCurrency', {
      pilotId,
      key,
      value
    });
    const pilotPatch = await api.patch({
      pilotId,
      key,
      value,
    });

    commit('patch', {
      pilotId,
      pilotPatch,
    });
    commit('clearEditPopoverProps');
  },
};

const mutations = {
  patchCurrency(state, { pilotId, key, value, }) {
    const pilotIndex = findIndex(state.pilots, pilot => pilot.id == pilotId);

    state.pilots = update(state.pilots, { [pilotIndex]: { pilot: { currency: { $merge: { [key]: value } } } } });
  },
  patch(state, { pilotId, pilotPatch, }) {
    const pilotIndex = findIndex(state.pilots, pilot => pilot.id == pilotId);

    state.pilots = update(state.pilots, { [pilotIndex]: { pilot: { $merge: pilotPatch } } });
  },
  setPilots(state, pilots) {
    state.pilots = pilots;
  },
  setTypes(state, types) {
    state.types = types;
  },
  setGroups(state, groups) {
    state.typeGroups = groups;
  },
  toggleType(state, { id, flag }) {
    const typeIndex = findIndex(state.types, type => type.id === id);

    state.types = update(state.types, { [typeIndex]: { $merge: { enabled: flag } } });
  },
  toggleTypes(state, { ids, flag }) {
    state.types = state.types.map((type) => {
      if (ids.includes(type.id)) {
        return {
          ...type,
          enabled: flag,
        };
      }

      return type;
    });
  },
  setEditPopoverProps(state, { pilotId, key }) {
    state.editPopover = {
      pilotId,
      key,
    };
  },
  clearEditPopoverProps(state) {
    state.editPopover = {
      pilotId: null,
      propName: null,
    };
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export const tableModule = {
  namespaced: true,
  state: {},
  getters: {},
  actions: {},
  mutations: {},
};
