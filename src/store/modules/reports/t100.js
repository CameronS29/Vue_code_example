import reportsApi from 'api/reports';
import {head, last, map, toPairs, zip, zipObject} from "lodash";
export const SET_REPORT_DATA = "SET_REPORT_DATA";
export const SET_MONTH = "SET_MONTH";
export const SET_YEAR = "SET_YEAR";

export default {
  namespaced: true,
  state: {
    year: (new Date()).getFullYear(),
    month: (new Date()).getMonth() + 1,
    data: [],
    totals: [],
  },
  getters: {
    t100Data: (state) => {
      const pairLists = toPairs(state.data);
      const keys = map(pairLists, head);
      const values = map(pairLists, last);

      const propList = zip(...values);
      return map(propList, prop => zipObject(keys, prop));
    },
    reportMonth: (state) => new Date(state.year, state.month-1, 4).toISOString()
  },
  actions: {
    async getT100Report({ commit, state }) {
      const response = await reportsApi.t100(state.year, state.month);
      commit(SET_REPORT_DATA, response[0])
    }
  },
  mutations: {
    [SET_REPORT_DATA](state, { data, totals }) {
      state.data = data;
      state.totals = totals;
    },
    [SET_MONTH](state, month) {
      state.month = month;
    },
    [SET_YEAR](state, year) {
      state.year = year;
    },
  },
}
