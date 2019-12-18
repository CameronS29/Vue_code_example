import { find, findIndex, sortBy } from 'lodash';

import loadingMixin, { affectLoading } from 'store/helpers/loading';
import fdtApi from 'api/fdt/legality';

export default loadingMixin({
  namespaced: true,

  state: {
    duties: [],
    editableDuty: {},
  },

  getters: {
    duties: state => state.duties,
  },

  actions: {
    @affectLoading
    async getDuties({ commit, rootState, rootGetters }, { filters } = {}) {
      const pilot = rootState.pilots.pilot.id;
      const monthDate =  rootGetters['fdt/calendar/date'];
      const startDate = monthDate.startOf('month');
      const endDate = monthDate.endOf('month');

      const duties = await fdtApi.listDuties({
        ...filters,
        pilot,
        duty_from: startDate.toISO(),
        duty_to: endDate.toISO(),
      });

      commit('setDuties', duties);
    },

    @affectLoading
    async saveDuty({ state, commit, dispatch, rootState }) {
      const pilot = rootState.pilots.pilot.id;
      const data = state.editableDuty;

      const action = data.id ? fdtApi.updateDuty : fdtApi.createDuty;
      await action({ pilot, ...data });

      return Promise.all([
        dispatch('fdt/calendar/getLegality', null, { root: true }),
        dispatch('getDuties'),
      ]);
    },

    @affectLoading
    async deleteDuty({ dispatch }, id) {
      await fdtApi.deleteDuty(id);
      return Promise.all([
        dispatch('fdt/calendar/getLegality', null, { root: true }),
        dispatch('getDuties'),
      ]);
    },
  },

  mutations: {
    setDuties(state, duties) {
      state.duties = duties;
    },

    setEditableDuty(state, duty) {
      state.editableDuty = duty;
    },
  },
});
