import * as consts from './consts';
import format from 'date-fns/format';
import manifestAPI from '../../../api/pilotManifest';


const defaultFilters = () => ({
  origin: '',
  destination: '',
  date: format(new Date(), 'MM/dd/yyyy'),
});

const state = {
  filterData: defaultFilters(),
  showFlightFilterModal: false,
};

const getters = {
  filterData: state => state.filterData,
};

const actions = {
  setFilterData({ commit, dispatch }, filterData = {}) {
    commit(consts.UPDATE_FLITHGT_FILTER, filterData);
  },

  reset({ commit }) {
    commit(consts.RESET_PICK_FLIGHT);
  },
  getFlightById({ commit }, flightId) {
    return manifestAPI.getFlight(flightId);
  },
};

const mutations = {
  [consts.UPDATE_FLITHGT_FILTER](state, filterData) {
    state.showFlightFilterModal = true;
    state.filterData = { ...state.filterData, ...filterData };
  },

  [consts.RESET_PICK_FLIGHT](state) {
    state.filterData = defaultFilters();
    state.showFlightFilterModal = false;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
