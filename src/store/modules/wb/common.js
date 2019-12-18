import { find, filter, sortBy } from 'lodash';

import options from '../../../api/options';
import * as consts from './consts';


const state = {
  availableAirports: [],
  availableAircrafts: [],
  availableAircraftTypes: [],
  availablePilots: [],
  availableUsers: [],
};

const getters = {
  availableAirports: state => state.availableAirports,
  availableAircraftTypes: state => state.availableAircraftTypes,
  availablePilots: state => state.availablePilots,
  availableUsers: state => state.availableUsers,

  availableAircrafts: state => sortBy(state.availableAircrafts, 'registration'),
  activeAircrafts: state => filter(state.availableAircrafts, { active: true }),
  availablePICPilots: state => filter(state.availablePilots, 'is_pic'),
  availableSICPilots: state => filter(state.availablePilots, 'is_sic'),
  availableAdminAndPilots: state => filter(
    state.availableUsers,
    u => (u.is_sic || u.is_pic || u.is_admin),
  ),
  airCraftByTailNumber: state => registration => find(
    state.availableAircrafts,
    { registration },
  ),
};

const actions = {
  getAllOptions({ commit }) {
    return options.getFlightOptions().then((options) => {
      commit(consts.RECEIVE_AIRCRAFT_TYPES, options.aircraft_types);
      commit(consts.RECEIVE_AIRCRAFTS, options.aircrafts);
      commit(consts.RECEIVE_AIRPORTS, options.airports);
    });
  },
  getAvailablePilots({ commit }) {
    return options.getPilotOptions()
      .then(options => commit(consts.RECEIVE_PILOTS, options));
  },
  getAvailableUsers({ commit }) {
    return options.getUserOptions()
      .then(options => commit(consts.RECEIVE_USERS, options));
  },
};

const mutations = {
  [consts.RECEIVE_AIRCRAFT_TYPES](state, types) {
    state.availableAircraftTypes = types;
  },
  [consts.RECEIVE_AIRCRAFTS](state, types) {
    state.availableAircrafts = types;
  },
  [consts.RECEIVE_AIRPORTS](state, types) {
    state.availableAirports = types;
  },
  [consts.RECEIVE_PILOTS](state, types) {
    state.availablePilots = types;
  },
  [consts.RECEIVE_USERS](state, types) {
    state.availableUsers = types;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};

