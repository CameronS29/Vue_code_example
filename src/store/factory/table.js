import Promise from 'bluebird';
import { throttle, pickBy, merge, findIndex } from 'lodash';

export const SET_RESULTS = 'SET_RESULTS';
export const INC_LOAD = 'INC_LOAD';
export const DEC_LOAD = 'DEC_LOAD';
export const INC_CSV_LOAD = 'INC_CSV_LOAD';
export const DEC_CSV_LOAD = 'DEC_CSV_LOAD';
export const SET_CSV_PATH = 'SET_CSV_PATH';
export const SET_SLIM_PAGER = 'SET_SLIM_PAGER';
export const SET_LAST_VALUABLE_PARAMS = 'SET_LAST_VALUABLE_PARAMS';

export const UPDATE_ITEM = 'UPDATE_ITEM';
export const DELETE_ITEM = 'DELETE_ITEM';

const getValuableParams = (filters, params) => pickBy(
  { ...filters, ...params },
  p => (p || p === 0),
);

/**
 * Creates store module with tables filtering
 * @param {Object} api
 * @param {Function} api.getFilteredResults
 * @param {Object} moduleMixin: Module to mix in table
 */
export default (api, moduleMixin = {}) => merge({
  namespaced: true,

  state: {
    count: 0,
    results: [],
    pending: 0,
    CSVpending: 0,
    CSVpath: null,
    slimPager: false,
    lastValuableParams: {},
  },

  getters: {
    results: state => state.results,
    count: state => state.count,
    pending: state => state.pending > 0,
    slimPager: state => state.slimPager,
  },

  actions: {
    getResults({ state, commit }, { filters, ...params }) {
      const valuableParams = getValuableParams(filters, params);

      commit(INC_LOAD);
      commit(SET_LAST_VALUABLE_PARAMS, valuableParams);

      api.getFilteredResults(valuableParams)
        .then(({ results, count }) => {
          if (valuableParams === state.lastValuableParams) {
            commit(SET_RESULTS, { results, count });
          }
        })
        .finally(() => commit(DEC_LOAD));
    },


    refreshResults({ commit, state }) {
      commit(INC_LOAD);
      return api.getFilteredResults(state.lastValuableParams)
        .then(({ results, count }) => commit(SET_RESULTS, { results, count }))
        .finally(() => commit(DEC_LOAD));
    },

    getCSVURL({ commit }, { filters, ...params }) {
      const valuableParams = getValuableParams(filters, params);
      const getURL = throttle(async (taskId) => {
        const res = await api.getCSVURL(taskId);

        if (res.state === 'SUCCESS') {
          return commit(SET_CSV_PATH, res.file_path);
        }
        await Promise.delay(1500);
        return getURL(taskId);
      });

      commit(INC_CSV_LOAD);
      return api.getCSVStatus(valuableParams)
        .then(({ id: taskId }) => getURL(taskId))
        .finally(() => commit(DEC_CSV_LOAD));
    },

    resetResults({ commit }) {
      commit(SET_RESULTS, { results: [], count: 0 });
    },

    setSlimPager({ commit }, isSlim) {
      commit(SET_SLIM_PAGER, isSlim);
    },

    updateItem({ commit }, item) {
      commit(UPDATE_ITEM, item);
    },

    deleteItem({ commit }, id) {
      commit(DELETE_ITEM, id);
    },
  },

  mutations: {
    [SET_RESULTS](state, { results, count }) {
      state.results = results;
      state.count = count;
    },
    [INC_LOAD](state) {
      state.pending += 1;
    },
    [DEC_LOAD](state) {
      state.pending -= 1;
    },
    [INC_CSV_LOAD](state) {
      state.CSVpending += 1;
    },
    [DEC_CSV_LOAD](state) {
      state.CSVpending -= 1;
    },
    [SET_CSV_PATH](state, path) {
      state.CSVpath = path;
    },
    [SET_SLIM_PAGER](state, isSlim) {
      state.slimPager = isSlim;
    },
    [SET_LAST_VALUABLE_PARAMS](state, lastValuableParams) {
      state.lastValuableParams = lastValuableParams;
    },

    [UPDATE_ITEM](state, item) {
      const itemIdx = findIndex(state.results, ['id', item.id]);

      if (itemIdx === -1) {
        state.results.splice(0, 0, item);
        state.count += 1;
      } else {
        state.results.splice(itemIdx, 1, item);
      }
    },

    [DELETE_ITEM](state, id) {
      const itemIdx = findIndex(state.results, { id });
      if (itemIdx !== -1) {
        state.results.splice(itemIdx, 1);
        state.count -= 1;
      }
    },
  },
}, moduleMixin);

