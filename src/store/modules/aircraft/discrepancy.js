import discrepancyAPI from 'api/dispatch/discrepancy';
import {findIndex} from 'lodash';
import update from 'immutability-helper';
import createTableStore from "store/factory/table";
import * as filterTypes from "Common/Filters/types";
import {DELETE_FLIGHT, PATCH_FLIGHT} from "store/modules/dispatch/flight-list";

const state = {
  discrepancies: [],
  currentDiscrepancy: null,
  completeDiscrepancy: null,
  availableFilters: [
    {key: 'resolved', label: 'Resolution', type: filterTypes.RESOLVED, value: false},
    {key: 'aircraft', label: 'Aircraft', type: filterTypes.AIRCRAFTS, value: [],},
    {key: 'recorder', label: 'Recorder', type: filterTypes.USER, value: [],},
    {key: 'category', label: 'MEL category', type: filterTypes.MEL_CATEGORY, value: [],},
    {key: 'pilot', label: 'PIC', type: filterTypes.PIC, value: [],},
    {key: 'date_recorded', label: 'Date Recorder', type: filterTypes.DATE_RANGE, value: [null, null],},
    {key: 'resolution_date', label: 'Actual OFF', type: filterTypes.DATE_RANGE, value: [null, null],},
  ],
};

const getters = {
  discrepancies: state => state.discrepancies,
};

export const TABLE_NAMESPACE = 'aircraft/discrepancy/table';
export const tableModule = {
  mutations: {
    update(state, itemCommit) {
      const index = findIndex(state.results, {id: itemCommit.id});

      if (index > -1) {
        state.results = update(state.results, {
          [index]: {
            $merge: itemCommit,
          },
        });
      } else {
        state.results = [...state.results, itemCommit];
      }
    },
    delete(state, itemId) {
      state.results = state.results.filter(item => item.id !== itemId);
    },
  }
};

const actions = {
  async fetchDiscrepancies({state, commit}) {
    const discrepancies = await discrepancyAPI.getDiscrepancies(state.correction);

    commit('setDiscrepancies', discrepancies);
  },
  async deleteDiscrepancy({commit}, item) {
    await discrepancyAPI.delete(item.id, );

    commit(`${TABLE_NAMESPACE}/delete`, item.id, { root: true });
  },
  async updateDiscrepancy({commit}, item) {
    commit(`${TABLE_NAMESPACE}/update`, item.id
      ? await discrepancyAPI.patch(item)
      : await discrepancyAPI.post(item), { root: true });
  },
};

const mutations = {
  setDiscrepancies(state, discrepancies) {
    state.discrepancies = discrepancies;
  },
  setCurrentDiscrepancy(state, item) {
    state.currentDiscrepancy = item;
  },
  setCompleteDiscrepancy(state, item) {
    state.completeDiscrepancy = item;
  },
  update(state, item) {
    const index = findIndex(state.discrepancies, {id: item.id});

    if (index > -1) {
      state.discrepancies = update(state.discrepancies, {[index]: {$merge: item}});
    } else {
      state.discrepancies = [...state.discrepancies, item];
    }
  },
  delete(state, id) {
    state.discrepancies = state.discrepancies.filter(item => item.id !== id);
  },
};

export default {
  namespaced: true,
  table: createTableStore(discrepancyAPI, tableModule),
  state,
  getters,
  mutations,
  actions,
};
