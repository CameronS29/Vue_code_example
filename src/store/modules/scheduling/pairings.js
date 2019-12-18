import { filter, find, isEmpty, keyBy, map, sortBy } from 'lodash';
import { DateTime } from 'luxon';

import createTableModule, { DELETE_ITEM } from 'store/factory/table';
import loaderMixin, { affectLoading } from 'store/helpers/loading';
import * as consts from 'store/modules/scheduling/consts';

import pairingTableMixin from './pairing-table';
import api, { pairings } from '../../../api/scheduling';
import reserve from './shifts/reserve';
import history from './calendar/history';
import updateForm from './shifts/update-form';

const tableModule = 'table';
export const pairingsTableNamespace = `scheduling/pairings/${tableModule}`;

const state = {
  editablePairingId: undefined,
  editablePairingFilterByFlightIds: [],
  nonListedShifts: [],
  pairingSplit: [],
  isPairingAdditionModalActive: false,
  activeTabIndex: 0,
  conflictContainedShiftId: null,
  conflictFlight: null,
  lastEditedShiftId: null,
  isAffectModalActive: false,
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

  editablePairing(state) {
    const pairingsResults = state[tableModule].results;
    return (pairingsResults
      ? find([...pairingsResults, ...state.nonListedShifts], { id: state.editablePairingId })
      : undefined);
  },

  alreadyAppliedFlights(state, getters) {
    if (!getters.editablePairing) {
      return {};
    }
    return keyBy(map(getters.editablePairing.flights, 'id'));
  },

  filterByFlights(state, getters) {
    if (!getters.editablePairing) {
      return [];
    }
    return getters.editablePairing.flights
      .filter(flight => state.editablePairingFilterByFlightIds.indexOf(flight.id) !== -1);
  },

  sortedSplit: state => state.pairingSplit.sort(),

  splitFlights(_, getters) {
    const split = getters.sortedSplit;
    if (isEmpty(split) || !getters.editablePairing) {
      return [];
    }

    const { flights } = getters.editablePairing;
    return map([...split, flights.length - 1], (idx, metaIdx) => {
      const prevIdx = metaIdx === 0 ? 0 : split[metaIdx - 1] + 1;
      return flights.slice(prevIdx, idx + 1);
    });
  },
};

const actions = {
  @affectLoading
  generateMonthlyPairing(_, { year, month }) {
    return api.generateMonthlyPairing({ year, month });
  },

  @affectLoading
  patchDraftChanges(_, draft) {
    return api.generateDraftPairing(draft);
  },

  patchEditablePairingFlights({ getters }) {
    const pairing = getters.editablePairing;

    return api.patchFlightsAtPairing({
      pairingId: pairing.id,
      flightIds: map(pairing.flights, 'id'),
    });
  },

  addPair({ rootGetters }, pairProps) {
    const { id } = rootGetters['scheduling/revisions/activeRevision'];
    return api.addPair({ ...pairProps, revision: id });
  },

  updatePair(_, pair) {
    return api.patchPair(pair);
  },

  async splitPair({ getters, commit, dispatch }) {
    const { editablePairing: { id }, splitFlights } = getters;
    const split = map(splitFlights, group => map(group, 'id'));

    await api.splitPair(id, split);
    commit(consts.CLEAR_PAIRING_SPLIT);
    return dispatch(`${pairingsTableNamespace}/refreshResults`, null, { root: true });
  },

  async removePairing({ commit }, pairingId) {
    await api.removePairing(pairingId);
    commit(`${pairingsTableNamespace}/${DELETE_ITEM}`, pairingId, { root: true });
  },

  async getShift({ commit }, shiftId) {
    const shift = await api.getShift(shiftId);
    commit(consts.ADD_NON_LISTED_SHIFT, shift);
  },
};

const mutations = {
  [consts.CHANGE_EDITABLE_PAIRING](state, id) {
    state.lastEditedShiftId = null;
    state.conflictContainedShiftId = null;
    state.conflictFlight = null;
    state.nonListedShifts = [];
    state.pairingSplit = [];

    state.editablePairingId = id;
    state.editablePairingFilterByFlightIds = [];
  },

  [consts.ADD_FILTER_BY_FLIGHT_ID](state, id) {
    state.editablePairingFilterByFlightIds = [...state.editablePairingFilterByFlightIds, id];
  },

  [consts.REMOVE_FILTER_BY_FLIGHT_ID](state, id) {
    state.editablePairingFilterByFlightIds = (
      state.editablePairingFilterByFlightIds
        .filter(flightId => flightId !== id)
    );
  },

  [consts.TOGGLE_PAIRING_ADDITION_MODAL](state, flag) {
    state.isPairingAdditionModalActive = flag;
  },

  [consts.ADD_FLIGHT_TO_PAIRING](_, { pairing, flight }) {
    pairing.flights = sortBy(
      [...pairing.flights.filter(f => f.flight_number !== flight.flight_number), flight],
      flight => DateTime.fromISO(flight.scheduled_departure),
    );
  },

  [consts.REMOVE_FLIGHT_FROM_PAIRING](_, { pairing, flight }) {
    pairing.flights = filter(pairing.flights, f => (flight.id !== f.id));
  },

  [consts.SET_ACTIVE_TAB_INDEX](state, activeTabIndex) {
    state.activeTabIndex = activeTabIndex;
  },

  [consts.SET_CONFLICT_CONTAINED_SHIFT_ID](state, shiftId) {
    state.conflictContainedShiftId = shiftId;
    state.editablePairingId = shiftId;
  },

  [consts.SET_CONFLICT_FLIGHT](state, flight) {
    state.conflictFlight = flight;
  },

  [consts.SET_LAST_EDITED_SHIFT_ID](state, shiftId) {
    state.lastEditedShiftId = shiftId;
  },

  [consts.ADD_NON_LISTED_SHIFT](state, shift) {
    state.nonListedShifts = [...state.nonListedShifts, shift];
  },

  [consts.GO_TO_PREVIOUS_EDITABLE](state) {
    state.editablePairingId = state.lastEditedShiftId;
    state.editablePairingFilterByFlightIds = [];

    state.lastEditedShiftId = null;
    state.conflictContainedShiftId = null;
    state.conflictFlight = null;
    state.nonListedShifts = [];
  },

  [consts.TOGGLE_AFFECT_MODAL](state, flag) {
    state.isAffectModalActive = flag;
  },

  [consts.ADD_PAIRING_SPLIT](state, idx) {
    state.pairingSplit.push(idx);
  },

  [consts.REMOVE_PAIRING_SPLIT](state, idx) {
    const iIdx = state.pairingSplit.indexOf(idx);
    if (iIdx !== -1) {
      state.pairingSplit.splice(iIdx, 1);
    }
  },

  [consts.CLEAR_PAIRING_SPLIT](state) {
    state.pairingSplit = [];
  },
};

export default loaderMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
  modules: {
    reserve,
    history,
    'update-form': updateForm,
    [tableModule]: createTableModule(pairings, pairingTableMixin),
  },
});
