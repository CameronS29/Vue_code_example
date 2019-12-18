import { DateTime } from 'luxon';

export default {
  namespaced: true,

  state: {
    date: DateTime.local().toISODate(),
  },
  getters: {},

  actions: {},

  mutations: {
    setDate(state, date) {
      state.date = date;
    },
  },
};

