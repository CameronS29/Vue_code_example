import Promise from 'bluebird';
import { find, mapValues, omit, isEmpty, merge, get } from 'lodash';
import { DateTime } from 'luxon';
import loaderMixin, { affectLoading } from 'store/helpers/loading';

import common from './common';
import comments from './comments';
import confirmation from './confirmation';
import confirmations from './confirmations';
import passenger from './passenger';
import calculations from './calculations';
import users from './users';
import locks from './locks';
import aircraftParams from './aircraft-params';
import tables from './tables';

import { namespacedBroadcasters } from '../../../sockets';
import wbLogAPI from '../../../api/wb/log';
import manifestAPI from '../../../api/pilotManifest';
import * as consts from './consts';
import { DELETE_ITEM } from 'store/factory/table';
import { trackAction } from '../../../tracking';


const { broadcastAction, broadcastMutation } = namespacedBroadcasters('wb');
const persistentParams = ['id', 'aircraft_type', 'aircraft', 'status', 'videcom_fetched'];

const state = {
  wbList: [],
  log: {},
  partialUpdate: {},
  externalPayload: {},
  errors: {},
  optionsLoaded: false,
  reopenWindow: false,
  saved: false,
  validate: false,
  validatePIC: false,
  detailed: false,
};

const getters = {
  log: state => merge(state.log, state.externalPayload, state.partialUpdate),
  open: state => state.log.status === consts.STATUS_OPEN,
  errors: state => state.errors,
  dueLocked: state => state.log.due_locked,
  isValid: state => isEmpty(state.errors),

  readyForApproval: state => state.log.status === consts.STATUS_READY_FOR_APPROVAL,
  readyForDispatch: state => state.log.status === consts.STATUS_PIC_APPROVAL,
  completed: state => state.log.status === consts.STATUS_COMPLETED,
  securityAware: state => state.log.security_check_aware,
  securityRestriction: state => state.log.security_automatic_restriction,

  saved: state => state.saved,
  detailed: state => state.detailed,
  isLoading: state => (state.loading > 0 || !isEmpty(state.partialUpdate)),
  isBlocked: (state, _g, _rs, rootGetters) => (
    rootGetters['wb/locks/isLocked'](state.log.id)
  ),
  blockingUser: (state, _g, _rs, rootGetters) => (
    rootGetters['wb/locks/lockUser'](state.log.id)
  ),

  validate: state => state.validate,
  reopenWindow: state => state.reopenWindow,
  showLockFields: (_, getters) => (
    getters.selectedAircraft
    && getters.selectedAircraft.show_wing_locker
  ),

  selectedAircraftType: state => find(
    state.common.availableAircraftTypes,
    { id: state.log.aircraft_type },
  ) || {},
  selectedAircraft: state => find(
    state.common.availableAircrafts,
    { id: state.log.aircraft },
  ),
  selectedDeparture: (state) => {
    if (state.log.departure) {
      const departure = find(
        state.common.availableAirports,
        { id: state.log.departure },
      );
      return departure.iata;
    }

    if (state.log.flight_data) {
      return state.log.flight_data.origin;
    }

    return undefined;
  },
  selectedArrival: (state) => {
    if (state.log.arrival) {
      const arrival = find(
        state.common.availableAirports,
        { id: state.log.arrival },
      );

      return arrival.iata;
    }

    if (state.log.flight_data) {
      return state.log.flight_data.destination;
    }

    return undefined;
  },

  selectedDate: (state) => {
    if (state.log.flight_data) {
      return DateTime
        .fromISO(state.log.flight_data.scheduled_departure, { zone: 'utc' })
        .toFormat('MM/dd/yyyy');
    }

    return state.log.date;
  },

  selectedFlightNumber: ({ log }) => (
    get(log, 'flight_data.flight_number', log.flight_number)
  ),

  selectedPIC: state => find(
    state.common.availablePilots,
    { id: state.log.pic },
  ),
  selectedSIC: state => find(
    state.common.availablePilots,
    { id: state.log.sic },
  ),
  selectedGSC: state => find(
    state.common.availableUsers,
    { id: state.log.gsc },
  ),
};

const actions = {
  @affectLoading
  async getWBLog({ commit, dispatch }, id) {
    const data = await wbLogAPI.getWBLog(id);
    commit(consts.RECEIVE_LOG, data);

    return dispatch('getCalculations', id);
  },

  @affectLoading
  async updateWBLog({ state, commit, dispatch }) {
    const { id, seats_count: seatsCount } = state.log;
    const data = await wbLogAPI.getWBLog(id);

    commit(consts.UPDATE_LOG, data);

    return await Promise.join(
      dispatch('updateLogStatus', data.seats_count !== seatsCount),
      dispatch('confirmations/getConfirmations', id),
    );
  },

  @affectLoading
  async pushWBLog({ commit, dispatch, state, getters }) {
    const seatsCount = state.log.seats_count;

    const data = await wbLogAPI.pushWBLog(getters.log);
    commit(consts.UPDATE_LOG, data);

    await dispatch('updateLogStatus', data.seats_count !== seatsCount);
  },

  @affectLoading
  async patchWBLog({ commit, dispatch, state }) {
    const { log: { id }, partialUpdate } = state;
    const seatsCount = state.log.seats_count;

    commit(consts.RESET_PARTIAL_UPDATE);

    const data = await wbLogAPI.patchWBLog(id, partialUpdate);
    await dispatch('updateLogStatus', data.seats_count !== seatsCount);
  },

  @affectLoading
  async patchWBLock({ commit, dispatch, state }, value) {
    const { log: { id } } = state;
    commit(consts.UPDATE_LOG, { due_locked: value });
    return await wbLogAPI.patchWBLock(id, { due_locked: value });
  },

  @affectLoading
  async updateLogStatus({ dispatch, state }, updatePax = false) {
    const { id } = state.log;
    return await Promise.join(
      (updatePax
        ? dispatch('passenger/receivePassengers', id)
        : Promise.resolve()),
      dispatch('getCalculations', id),
      dispatch(broadcastAction(`wb:${id}`, 'getCalculations', id), { root: true }),
    );
  },

  @affectLoading
  async getValidations({ dispatch, commit, state }, id) {
    try {
      const { errors } = await wbLogAPI.getValidations(id);
      commit(consts.SET_ERRORS, errors);
    } catch (e) {
      const { data, status } = e.response;
      if (status === 400) {
        commit(consts.SET_ERRORS, data);
      } else {
        throw e;
      }
    }
  },

  @affectLoading
  markWBLogReady({ commit }, logId) {
    return wbLogAPI.markWBLogReady(logId);
  },

  @affectLoading
  sendPDF({ commit }, logId) {
    return wbLogAPI.sendPDF(logId);
  },

  setPartialUpdate({ commit, dispatch, state: { log: { id } } }, payload) {
    commit(consts.SET_PARTIAL_UPDATE, payload);
    const externalMutation = broadcastMutation(
      `wb:${id}`,
      consts.EXTERNAL_LOG_UPDATE,
      payload,
    );
    return dispatch(externalMutation, { root: true });
  },

  async flushRemotePartials({ dispatch, state }) {
    const { id } = state.log;
    await dispatch(broadcastAction(`wb:${id}`, 'patchWBLog'), { root: true });
    return Promise.delay(500);
  },

  reset({ commit, dispatch }) {
    commit(consts.RESET);
    dispatch('passenger/reset');
    dispatch('resetCalculations');
  },

  softReset({ commit, dispatch, state: { log: { id } } }) {
    commit(consts.SOFT_RESET);
    dispatch(broadcastMutation(`wb:${id}`, consts.SOFT_RESET), { root: true });
    return dispatch('pushWBLog');
  },

  @affectLoading
  async deleteLog({ commit }, id) {
    await wbLogAPI.deleteWBLog(id);
    commit(`tables/openLogs/${DELETE_ITEM}`, id);
    commit(`tables/completedLogs/${DELETE_ITEM}`, id);
  },

  @affectLoading
  async patchFlight({ commit, state }, data) {
    const { id } = state.log.flight_data;

    const flight = await manifestAPI.patchFlight(id, data);
    commit(consts.UPDATE_LOG, { flight_data: flight });
  },
};

const mutations = {
  [consts.RESET](state) {
    state.log = {};
    state.partialUpdate = {};
    state.errors = {};
    state.validate = false;
  },
  [consts.SOFT_RESET](state) {
    state.log = {
      ...state.log,
      ...mapValues(
        omit(state.log, persistentParams),
        () => null,
      ),
    };
    state.partialUpdate = {};
    state.validate = false;
  },
  [consts.RECEIVE_LOG](state, log = {}) {
    state.log = log;
  },
  [consts.UPDATE_LOG](state, log = {}) {
    state.log = {
      ...state.log,
      ...log,
    };
  },
  [consts.SET_PARTIAL_UPDATE](state, payload = {}) {
    state.partialUpdate = {
      ...state.partialUpdate,
      ...payload,
    };
  },
  [consts.RESET_PARTIAL_UPDATE](state, payload = {}) {
    state.partialUpdate = payload;
    state.externalPayload = {};
  },
  [consts.EXTERNAL_LOG_UPDATE](state, payload = {}) {
    state.externalPayload = {
      ...state.externalPayload,
      ...payload,
    };
  },
  [consts.SET_BLOCK](state, value) {
    state.blocked = value;
  },
  [consts.SET_VALIDATE](state, value) {
    state.validate = value;
  },
  [consts.SET_SAVED](state, value) {
    state.saved = value;
  },
  [consts.SET_REOPEN](state, value) {
    state.reopenWindow = value;
  },
  [consts.TOGGLE_DETAILED](state) {
    state.detailed = !state.detailed;
  },
  [consts.SET_ERRORS](state, errors) {
    state.errors = errors;
  },
};


export default loaderMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,

  modules: {
    passenger,
    confirmation,
    confirmations,
    comments,
    common,
    calculations,
    users,
    locks,
    tables,
    'aircraft-params': aircraftParams,
  },
});
