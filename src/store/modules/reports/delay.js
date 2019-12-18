import { map, zip, zipObject, toPairs, head, last } from 'lodash';
import reportsApi from 'api/reports';
import loadingMixin, { affectLoading } from 'store/helpers/loading';

const SET_REPORT_DATA = 'SET_REPORT_DATA';


export default loadingMixin({
  namespaced: true,

  state: {
    reportData: [],
  },

  getters: {
    reportRecords: ({ reportData }) => (
      map(reportData, ({ title, data }) => {
        const pairLists = toPairs(data);
        const keys = map(pairLists, head);
        const values = map(pairLists, last);

        const propList = zip(...values);
        return { title, data: map(propList, prop => zipObject(keys, prop)) };
      })
    ),
  },

  actions: {
    @affectLoading
    async getReport({ commit }, filters = {}) {
      const data = await reportsApi.getDelays(filters);
      commit(SET_REPORT_DATA, data);
    },
  },

  mutations: {
    [SET_REPORT_DATA](state, data) {
      state.reportData = data;
    },
  },
});
