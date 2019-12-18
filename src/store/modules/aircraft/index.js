import AircraftAPI from "../../../api/aircraft";
import * as consts from "./consts";
import engineSwap from "./engine-swap";
import correction from "./correction";
import engineCorrections from "./corrections";
import engineSwaps from "./engine-swaps";
import mel from "./mel";
import discrepancy from "./discrepancy";

import update from 'immutability-helper';
import sortBy from 'lodash/sortBy';
import find from 'lodash/find';
import matchesProperty from 'lodash/matchesProperty';
import { findIndex, keys, keyBy } from "lodash";


const initialAircraft = {
  type: null,
  serial: "",
  registration: "",
  aircraft_type: null,
  yom: null,
  show_fuel_on_board_aux: true,
  show_wing_locker: true,
  active: true,
  date_purchased: null,
  bew: null,
  bew_cg: null,
  base_aftt: null,
  base_manifest_number: null,
  base_hobbs: null,
  base_airframe_landings: null,
  engine_1: null,
  engine_2: null
};

const state = {
  aircraftTypes: [],
  aircrafts: [],
  aircraft: Object.assign({}, initialAircraft),
  tail_number_filter: null
};

const getters = {
  aircraft: state => state.aircraft,
  aircrafts: state => sortBy(state.aircrafts, 'registration'),
  aircraftTypes: state => state.aircraftTypes,
  secondLevelAircraftTypes: state => keys(keyBy(state.aircrafts, aircraft => aircraft.type.type)),
  tailNumberFilter: state => state.tail_number_filter,
  filteredAircrafts: state => state.aircrafts.filter(aircraft => {
    if (state.tail_number_filter) {
      return aircraft.registration === state.tail_number_filter;
    } else {
      return true;
    }
  }),

  selectedAircraftType: state => find(
    state.aircraftTypes,
    matchesProperty('id', state.aircraft.type),
  ),
  aircraftById: state => id => find(
    state.aircrafts,
    { id },
  ),
  aircraftTypeById: state => id => find(
    state.aircraftTypes,
    { id },
  ),
};

const actions = {
  getAircrafts({commit}) {
    AircraftAPI.listAircrafts((aircrafts) => {
      commit(consts.SET_AIRCRAFTS, aircrafts);
    });
  },
  getAircraft({commit}, id) {
    AircraftAPI.getAircraft(id).then((aircraft) => commit(consts.SET_AIRCRAFT, aircraft));
  },
  getAircraftTypes({commit}) {
    return AircraftAPI.listAircraftTypes().then((types) => commit(consts.SET_AIRCRAFT_TYPES, types));
  },
  pushAircraft({commit, state}) {
    return AircraftAPI.pushAircraft(state.aircraft);
  }
};

const mutations = {
  [consts.SET_AIRCRAFT](state, aircraft) {
    state.aircraft = aircraft;
  },
  [consts.SET_AIRCRAFTS](state, aircrafts) {
    state.aircrafts = aircrafts;
  },
  [consts.PATCH_AIRCRAFT](state, { id, mixin }) {
    const index = findIndex(state.aircrafts, { id });

    state.aircrafts = update(state.aircrafts, { [index]: { $merge: mixin } });
  },
  [consts.SET_AIRCRAFT_TYPES](state, aircraftTypes) {
    state.aircraftTypes = aircraftTypes;
  },
  [consts.SET_TAIL_NUMBER_FILTER](state, tail_number) {
    state.tail_number_filter = tail_number;
  },
  [consts.UPDATE_AIRCRAFT](state, payload) {
    state.aircraft = {
      ...state.aircraft,
      ...payload
    };
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
  modules: {
    engineSwap,
    correction,
    engineSwaps,
    engineCorrections,
    mel,
    discrepancy,
  }
}
