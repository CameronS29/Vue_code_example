import SwapAPI from "../../../api/swap";
import * as consts from "./consts";
import LogAPI from "../../../api/flightlog";

const initialSwap = {
  aircraft: null,
  engine: null,
  default: false,
  d: false,
  date_of_removal: null,
  date_of_install: null,
  date_for_swap: null,
  last_log: null,
  position: 1,
  swap_type: 0,
  time_at_install: null,
  cycles_at_install: null,
  comments: null,
};
const state = {
  swap: Object.assign({}, initialSwap),
  originalSwap: Object.assign({}, initialSwap),
  displayInstall: false,
  engineTimeEdit: true
};

const getters = {
  swap: state => state.swap,
  defaultValue: state => state.swap.default,
  notDefaultValue: state => !state.swap.default,
  originalSwap: state => state.originalSwap,
  engine: state => state.swap.engine,
  aircraft: state => state.swap.aircraft,
  installDate: state => state.swap.date_of_install,
  lastLog: state => state.swap.last_log,
  removalDate: state => state.swap.date_of_removal,
  swapDate: state => state.swap.date_for_swap,
  swapType: state => state.swap.swap_type,
  timeAtInstall: state => state.swap.time_at_install,
  cyclesAtInstall: state => state.swap.cycles_at_install,
  isRemoval: state => state.swap_type === consts.SWAP_REMOVAL,
  isInstall: state => state.swap_type === consts.SWAP_INSTALL,
  selectedSwap: (state, getters, rootState, rootGetters) => {
    return rootState.engine.engines.filter(e => e.id === state.swap.engine)[0];
  },
  selectedAircraft: (state, getters, rootState, rootGetters) => {
    if (rootState.aircraft.aircrafts) {
      return rootState.aircraft.aircrafts.filter(e => e.id === state.swap.aircraft)[0];
    }
  }
};

const actions = {
  updateSwap({state, commit}, cb) {
    return SwapAPI.pushEngineSwap(state.swap).then((data) => {
      commit(consts.SET_SWAP, data);
      return data;
    });
  },
  recalcSwap({state, commit}, cb) {
    SwapAPI.recalcEngineSwap(state.swap, (data) => {
      if (cb) {
        cb(data);
      }
    });
  },
  getSwap({commit}, id) {
    return SwapAPI.getEngineSwap(id).then(data => {
      commit(consts.SET_SWAP, data);
      commit(consts.SET_ORIGINAL_SWAP, data);
    });
  },
  updateEngineTimes({getters, commit}, date = null) {
    const engine = getters.selectedSwap.id;
    LogAPI.getFilteredLogs({
      engine: getters.selectedSwap.id,
      actual_datetime_out_1: date
    }, 1, 1, ({results}) => {
      let time_at_install, cycles_at_install;
      if (results.length) {
        if (results[0].state.engine_1 === engine) {
          time_at_install = results[0].state.engine_1_time;
          cycles_at_install = results[0].state.engine_1_cycles;
        } else if (results[0].state.engine_2 === engine) {
          time_at_install = results[0].state.engine_2_time;
          cycles_at_install = results[0].state.engine_2_cycles;
        }
      } else {
        time_at_install = getters.selectedSwap.base_engine_time;
        cycles_at_install = getters.selectedSwap.base_engine_cycles;
      }
      commit(consts.SET_INSTALL_TIMES, {time_at_install, cycles_at_install})
    });
  }
};

const mutations = {
  [consts.UPDATE_SWAP](state, payload) {
    state.swap = {
      ...state.swap,
      ...payload
    };
  },
  [consts.SET_INSTALL_DATE](state, date) {
    state.swap.date_of_install = date;
  },
  [consts.SET_REMOVAL_DATE](state, date) {
    state.swap.date_of_removal = date;
  },
  [consts.SET_SWAP_DATE](state, date) {
    state.swap.date_for_swap = date;
  },
  [consts.SET_LAST_LOG](state, log) {
    state.swap.last_log = log;
  },
  [consts.SET_AIRCRAFT](state, aircraft) {
    state.swap.aircraft = aircraft;
  },
  [consts.SET_POSITION](state, position) {
    state.swap.position = position;
  },
  [consts.SET_SWAP](state, swap) {
    state.swap = Object.assign({}, initialSwap, swap);
  },
  [consts.SET_TIME_EDIT](state, val) {
    state.engineTimeEdit = val;
  },
  [consts.SET_ORIGINAL_SWAP](state, swap) {
    state.originalSwap = swap;
  },
  [consts.SET_DISPLAY_INSTALL](state, val) {
    state.displayInstall = val;
  },
  [consts.SET_INSTALL_TIMES](state, {time_at_install, cycles_at_install}) {
    state.swap.time_at_install = time_at_install;
    state.swap.cycles_at_install = cycles_at_install;
  },
  [consts.SET_TIME_AT_INSTALL](state, time_at_install) {
    state.swap.time_at_install = time_at_install;
  },
  [consts.SET_CYCLES_AT_INSTALL](state, cycles_at_install) {
    state.swap.cycles_at_install = cycles_at_install;
  },
  [consts.SET_SWAP_TYPE](state, type) {
    state.swap.swap_type = type;
  },
  [consts.RESET_SWAP](state) {
    state.swap = Object.assign({}, initialSwap);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
