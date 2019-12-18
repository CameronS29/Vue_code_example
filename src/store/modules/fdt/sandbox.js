import loaderMixin, { affectLoading } from 'store/helpers/loading';
import api from 'api/fdt/sandbox';


export const ModelTypes = {
  Flight: 0,
  Duty: 1,
};

const updateSchedule = (dispatch, action, payload) => Promise.all([
  dispatch('fdt/calendar/getLegality', null, { root: true }),
  dispatch(action, payload),
]);

export default loaderMixin({
  namespaced: true,

  state: {
    flights: [],
    duties: [],

    editableType: undefined,
    editableModel: {},

    importFilters: {},
  },

  getters: {
    hasEditableFlight: state => state.editableType === ModelTypes.Flight,
    hasEditableDuty: state => state.editableType === ModelTypes.Duty,

    newModel: state => state.editableModel.id === undefined,
  },

  actions: {
    @affectLoading
    async getFlights({ commit }, filters = {}) {
      const flights = await api.listFlight(filters);
      commit('setFlights', flights);
    },

    @affectLoading
    async getDuties({ commit }, filters = {}) {
      const duties = await api.listDuties(filters);
      commit('setDuties', duties);
    },

    @affectLoading
    async saveFlight({ dispatch, state: { editableModel } }) {
      const action = editableModel.id === undefined ? api.createFlight : api.updateFlight;
      await action(editableModel);
      return updateSchedule(dispatch, 'getFlights');
    },

    @affectLoading
    async saveDuty({ dispatch, state: { editableModel } }) {
      const action = editableModel.id === undefined ? api.createDuty : api.updateDuty;
      await action(editableModel);
      return updateSchedule(dispatch, 'getDuties');
    },

    @affectLoading
    async deleteFlight({ dispatch }, id) {
      await api.deleteFlight(id);
      return updateSchedule(dispatch, 'getFlights');
    },

    @affectLoading
    async deleteDuty({ dispatch }, id) {
      await api.deleteDuty(id);
      return updateSchedule(dispatch, 'getDuties');
    },

    @affectLoading
    async importActual({ dispatch, state, rootState }) {
      const pilot = rootState.pilots.pilot.id;
      await api.importActual({ ...state.importFilters, pilot });
      return Promise.all([
        dispatch('getFlights'),
        dispatch('getDuties'),
        dispatch('fdt/calendar/getLegality', null, { root: true }),
      ]);
    },
  },

  mutations: {
    setFlights(state, flights) {
      state.flights = flights;
    },

    setDuties(state, duties) {
      state.duties = duties;
    },

    clearEditable(state) {
      state.editableType = undefined;
      state.editableModel = {};
    },

    updateEditable(state, payload) {
      state.editableModel = {
        ...state.editableModel,
        ...payload,
      };
    },

    setImportFilters(state, data) {
      state.importFilters = {
        ...state.importFilters,
        ...data,
      };
    },

    setEditableFlight(state, flight) {
      state.editableType = ModelTypes.Flight;
      state.editableModel = flight;
    },

    setEditableDuty(state, duty) {
      state.editableType = ModelTypes.Duty;
      state.editableModel = duty;
    },
  },
});
