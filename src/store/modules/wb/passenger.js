import Promise from 'bluebird';

import map from 'lodash/map';
import find from 'lodash/find';
import has from 'lodash/has';
import fromPairs from 'lodash/fromPairs';
import sortBy from 'lodash/orderBy';

import loadingMixin, { affectLoading, affectLoadingNs } from 'store/helpers/loading';
import { namespacedBroadcasters } from '../../../sockets';
import wbLogAPI from '../../../api/wb/log';
import * as consts from './consts';

const state = {
  passengers: [],
  pending: 0,
};

const { broadcastMutation } = namespacedBroadcasters('wb/passenger');
const { broadcastAction } = namespacedBroadcasters('wb');

const initialPassenger = {
  full_name: '',
  weight: null,
  lap_bag: null,
  gate_bag: null,
  tsa_bag: null,
  gate_bag_count: null,
  tsa_bag_count: null,
  gate_bag_wing_locker: null,
  gate_bag_wing_locker_count: null,
  tsa_bag_wing_locker: null,
  tsa_bag_wing_locker_count: null,
};

const getters = {
  sortedPassengers: ({ passengers }) => sortBy(passengers, 'seat_number'),
  seatMap: ({ passengers }) => fromPairs(map(
    passengers,
    ({ id, seat_number }) => ([id, seat_number]),
  )),
};

const actions = {
  @affectLoading
  @affectLoadingNs('wb')
  async receivePassengers({ commit }, wbLogId) {
    const passengers = await wbLogAPI.getWBLogPassengers(wbLogId);
    commit(consts.RECEIVE_PASSENGERS, passengers);
  },

  @affectLoading
  @affectLoadingNs('wb')
  async pushPassenger({ commit, dispatch, state }, passenger) {
    const data = await wbLogAPI.pushPassenger(passenger);

    const logId = data.wb_log;
    return Promise.all([
      dispatch(
        broadcastAction(`wb:${logId}`, 'getCalculations', logId),
        { root: true },
      ),
      dispatch('wb/getCalculations', logId, { root: true }),
    ]);
  },

  remapSeats({ commit, state, dispatch }) {
    state.passengers.forEach((passenger, seat) => {
      if ((seat + 1) !== passenger.seat_number) {
        const payload = { seat_number: seat + 1 };
        commit(consts.UPDATE_PASSENGER, { passenger, payload });
      }
    });
    return dispatch('commitSeatMap');
  },

  @affectLoadingNs('wb')
  async commitSeatMap({ commit, dispatch, getters: { seatMap }, rootState }) {
    const { id: logId } = rootState.wb.log;
    dispatch(broadcastMutation(`wb:${logId}`, consts.APPLY_SEAT_MAP, seatMap), { root: true });

    await wbLogAPI.pushSeatNumber(logId, seatMap);
    dispatch('wb/getCalculations', logId, { root: true });
    dispatch(broadcastAction(`wb:${logId}`, 'getCalculations', logId), { root: true });
  },

  updatePassenger({ commit, dispatch }, { passenger, payload }) {
    const { id, wb_log: logId } = passenger;
    const mut = { id, payload };

    dispatch(broadcastMutation(`wb:${logId}`, consts.UPDATE_PASSENGER_BY_ID, mut), { root: true });
    commit(consts.UPDATE_PASSENGER, { passenger, payload });
  },

  resetPassenger({ dispatch, commit }, passenger) {
    const { id, wb_log: logId } = passenger;
    const payload = {
      ...passenger,
      ...initialPassenger,
    };

    commit(consts.UPDATE_PASSENGER, { passenger, payload });
    dispatch(
      broadcastMutation(`wb:${logId}`, consts.UPDATE_PASSENGER_BY_ID, { id, payload }),
      { root: true },
    );
  },

  @affectLoading
  async fetchVidecomPassengers({ commit, dispatch }, logId) {
    const { broadcastMutation: logMutation } = namespacedBroadcasters('wb');
    const payload = { videcom_fetched: true };

    const passengers = await wbLogAPI.fetchVidecomPassengers(logId);
    commit(`wb/${consts.UPDATE_LOG}`, payload, { root: true });
    commit(consts.RECEIVE_PASSENGERS, passengers);

    dispatch(logMutation(`wb:${logId}`, consts.UPDATE_LOG, payload), { root: true });
    dispatch(broadcastMutation(`wb:${logId}`, consts.RECEIVE_PASSENGERS, passengers), { root: true });
  },

  reset({ commit }) {
    commit(consts.RESET_PASSENGERS);
  },

  softReset({ commit }) {
    commit(consts.SOFT_RESET_PASSENGERS);
  },
};

const mutations = {
  [consts.RESET_PASSENGERS](state) {
    state.passengers = [];
    state.pending = 0;
  },
  [consts.SOFT_RESET_PASSENGERS](state) {
    state.passengers = map(state.passengers, passenger => ({
      ...passenger,
      ...initialPassenger,
    }));
  },
  [consts.RECEIVE_PASSENGERS](state, passengers) {
    state.passengers = passengers;
  },
  [consts.UPDATE_PASSENGER](_state, { passenger, payload }) {
    Object.assign(passenger, payload);
  },
  [consts.UPDATE_PASSENGER_BY_ID](state, { id, payload }) {
    const passenger = find(state.passengers, ['id', id]);
    if (passenger !== undefined) {
      Object.assign(passenger, payload);
    }
  },
  [consts.APPLY_SEAT_MAP](state, seatMap) {
    state.passengers = map(state.passengers, passenger => ({
      ...passenger,
      seat_number: has(seatMap, passenger.id)
        ? seatMap[passenger.id]
        : passenger.seat_number,
    }));
  },
  [consts.ORDER_DESC](state) {
    state.passengers = sortBy(state.passengers, p => (-p.weight || 0));
  },
  [consts.ORDER_ASC](state) {
    state.passengers = sortBy(state.passengers, p => (p.weight || 0));
  },
  [consts.SET_PENDING](state, pending) {
    state.pending = pending;
  },
};

export default loadingMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});
