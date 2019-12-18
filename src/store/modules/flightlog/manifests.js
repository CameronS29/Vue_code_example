import * as consts from './consts';
import flightManifestAPI from "../../../api/flight-manifest";


export const manifestSpaced = (module, action) => `${module}/${action}`;

const createLogStore = (statuses = []) => ({
  namespaced: true,

  state: {
    page: 1,
    pageSize: consts.DEFAULT_PAGE_SIZE,
    logList: [],
    count: 0,
    loaded: true,
  },

  getters: {
    logList: ({ logList }) => logList,
    page: ({ page }) => page,
    pageSize: ({ pageSize }) => pageSize,
    count: ({ count }) => count,
    isLoaded: ({ loaded }) => loaded,
  },

  actions: {
    getLogs({ commit, state: { page, pageSize } }, { filters = {} } = {}) {
      commit(consts.SET_LOAD_STATUS, false);

      return flightManifestAPI.getManifests({
        ...filters,
        status: statuses,
        size: pageSize,
        page,
      })
        .then(res => commit(consts.SET_LOGS, res.data))
        .finally(() => commit(consts.SET_LOAD_STATUS, true));
    },
    setPageSize({ commit }, pageSize) {
      commit(consts.SET_PAGE_SIZE, pageSize);
    },
    setPage({ commit }, page) {
      commit(consts.SET_PAGE, page);
    },
    reset({ commit }) {
      commit(consts.RESET);
    },
  },

  mutations: {
    [consts.RESET](state) {
      state.page = 1;
      state.pageSize = consts.DEFAULT_PAGE_SIZE;
    },
    [consts.SET_LOGS](state, { results, count }) {
      state.logList = results;
      state.count = count;
    },
    [consts.SET_PAGE_SIZE](state, pageSize) {
      state.pageSize = pageSize;
    },
    [consts.SET_PAGE](state, page) {
      state.page = page;
    },
    [consts.SET_LOAD_STATUS](state, isLoaded) {
      state.loaded = isLoaded;
    },
  },
});

export default createLogStore;
