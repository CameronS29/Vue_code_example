import parse from 'date-fns/parse';
import loaderMixin, { affectLoading } from 'store/helpers/loading';
import schedulingApi from 'api/scheduling';
import { FNS_US_DATE_FORMAT } from 'store/modules/scheduling/consts';

export const SET_YEAR = 'SET_YEAR';
export const SET_HOLIDAYS = 'SET_HOLIDAYS';

export default loaderMixin({
  namespaced: true,

  state: {
    year: new Date(),
    holidays: [],
  },

  getters: {
    holidayList({ holidays }) {
      const zeroDate = new Date(0);
      return holidays.map(h => parse(h.date, FNS_US_DATE_FORMAT, zeroDate));
    },
  },

  actions: {
    @affectLoading
    async getHolidays({ state, commit }, { year = state.year } = {}) {
      commit(SET_YEAR, year);
      commit(SET_HOLIDAYS, []);

      const data = await schedulingApi.fetchHolidays(state.year.getFullYear());
      commit(SET_HOLIDAYS, data);
    },

    @affectLoading
    async saveHoliday({ dispatch, state }, data) {
      if (data.id === undefined) {
        await schedulingApi.createHoliday(data);
      } else {
        await schedulingApi.updateHoliday(data);
      }
      return dispatch('getHolidays');
    },

    @affectLoading
    async deleteHoliday({ dispatch, state }, id) {
      await schedulingApi.deleteHoliday(id);
      return dispatch('getHolidays');
    }
  },

  mutations: {
    [SET_YEAR](state, year) {
      state.year = year;
    },
    [SET_HOLIDAYS](state, holidays) {
      state.holidays = holidays;
    },
  },
});
