import loaderMixin, { affectLoading } from 'store/helpers/loading';
import * as consts from 'store/modules/scheduling/consts';
import createTableStore from 'store/factory/table';
import api, { reserveShiftsTableApi } from 'api/scheduling';

const getShiftTable = namespace => `scheduling/pairings/reserve/${namespace}`;

const reserveShifts = 'reserveTable';
const trainingShifts = 'trainingTable';
const officeShifts = 'officeTable';
const travelShifts = 'travelTable';

export const reserveTableNamespace = getShiftTable(reserveShifts);
export const trainingTableNamespace = getShiftTable(trainingShifts);
export const officeTableNamespace = getShiftTable(officeShifts);
export const travelTableNamespace = getShiftTable(travelShifts);

export const tableNamespaceByTypeId = (typeId) => {
  switch (typeId) {
    case consts.RESERVE_TYPE_ID:
      return reserveTableNamespace;
    case consts.OFFICE_TYPE_ID:
      return officeTableNamespace;
    case consts.TRAINING_TYPE_ID:
      return trainingTableNamespace;
    case consts.TRAVEL_TYPE_ID:
      return travelTableNamespace;
    default:
      return undefined;
  }
};

const state = {
  editableReserveShift: null,
};

const getters = {
  editableReserveShift: state => state.editableReserveShift,
};

const actions = {
  @affectLoading
  async saveReserveShift({ commit, state, rootGetters }, payload) {
    const apiReadyModel = {
      ...state.editableReserveShift,
      ...payload,
    };

    if (apiReadyModel.shift_type === undefined) {
      apiReadyModel.shift_type = rootGetters['scheduling/pairings/activeReserveTypeId'];
    }

    const model = state.editableReserveShift.id
      ? await api.patchReserveShift(apiReadyModel)
      : await api.postReserveShift(apiReadyModel);

    commit(consts.SET_EDITABLE_RESERVE_SHIFT, model);
    return model;
  },

  async deleteReserveShift({ commit, state }, id) {
    await api.deleteReserveShift(id);

    if (state.editableReserveShift && (state.editableReserveShift.id === id)) {
      commit(consts.SET_EDITABLE_RESERVE_SHIFT, null);
    }
  },

  async refreshTables({ dispatch }) {
    [reserveShifts, trainingShifts, officeShifts, travelShifts]
      .forEach(reserveModule => dispatch(`${reserveModule}/refreshResults`));
  },
};

const mutations = {
  [consts.SET_EDITABLE_RESERVE_SHIFT](state, reserveShift) {
    state.editableReserveShift = reserveShift;
  },
  [consts.UPDATE_RESERVE_SHIFT](state, payload) {
    state.editableReserveShift = {
      ...state.editableReserveShift,
      ...payload,
    };
  },
};

export default loaderMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,

  modules: {
    [reserveShifts]: createTableStore(reserveShiftsTableApi),
    [trainingShifts]: createTableStore(reserveShiftsTableApi),
    [officeShifts]: createTableStore(reserveShiftsTableApi),
    [travelShifts]: createTableStore(reserveShiftsTableApi),
  },
});
