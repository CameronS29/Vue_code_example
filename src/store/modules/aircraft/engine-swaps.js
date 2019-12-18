import SwapAPI from "../../../api/swap";
import * as consts from "./consts";
import {sortBy, last, filter} from "lodash";

const state = {
  swaps: [],
  aircraft: null
};

const getters = {
  swaps: state => state.swaps,
  lastSwap: state => {
    let sorted = sortBy(state.swaps, (swap) => swap.date_of_removal);
    if (sorted.length) {
      return last(sorted);
    }
  },
  selectedAircraft: (state, getters, rootState, rootGetters) => {
    return rootState.aircraft.aircrafts.filter(a => a.id === state.aircraft)[0];
  }
};

const actions = {
  getSwaps({commit}, aircraft) {
    commit(consts.SET_SWAP_LIST_AIRCRAFT, aircraft);
    return SwapAPI.listEngineSwaps(aircraft).then(data => commit(consts.SET_SWAPS, data));
  },
  removeSwap({dispatch, commit}, swap) {
    commit(consts.REMOVE_SWAP, swap);
    return SwapAPI.removeEngineSwap(swap.id);
  },
};

const mutations = {
  [consts.SET_SWAP_LIST_AIRCRAFT](state, aircraft) {
    state.aircraft = aircraft;
  },
  [consts.SET_SWAPS](state, swaps) {
    state.swaps = swaps;
  },
  [consts.REMOVE_SWAP](state, removedSwap) {
    state.swaps = filter(state.swaps, (swap) => swap.id !== removedSwap.id);
  },
  [consts.RESET_SWAPS](state) {
    state.swaps = [];
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

