import { findIndex, isEmpty } from 'lodash';
import { DateTime } from 'luxon';

import api, { reserveTemplatesTableApi } from "../../../../api/scheduling";
import loaderMixin, { affectLoading } from 'store/helpers/loading';
import * as consts from "store/modules/scheduling/consts";
import createTableStore from "store/factory/table";

const reserveTemplates = 'reserveTable';
export const reserveTableNamespace = `scheduling/pairingTemplates/reserve/${reserveTemplates}`;

const trainingTemplates = 'trainingTable';
export const trainingTableNamespace = `scheduling/pairingTemplates/reserve/${trainingTemplates}`;

const officeTemplates = 'officeTable';
export const officeTableNamespace = `scheduling/pairingTemplates/reserve/${officeTemplates}`;

export const tableNamespaceByTypeId = typeId => {
  switch (typeId) {
    case consts.RESERVE_TYPE_ID:
      return reserveTableNamespace;
    case consts.OFFICE_TYPE_ID:
      return officeTableNamespace;
    case consts.TRAINING_TYPE_ID:
      return trainingTableNamespace;
  }
};

const state = {
  editableReserveTemplate: null,
  editableTemplateChanges: [],
  changesLoading: false,
};

const getters = {
  editableReserveTemplate: state => state.editableReserveTemplate,
  hasTemplateChanges: state => !isEmpty(state.editableTemplateChanges),
};

const actions = {
  @affectLoading
  async saveReserveTemplate({ commit, dispatch, state, rootGetters }) {
    const toApiCompatibleTime = date => {
      return DateTime.fromISO(date).toFormat('HH:mm');
    };
    const apiReadyModel = {
      ...state.editableReserveTemplate,
      duty_on: toApiCompatibleTime(state.editableReserveTemplate.duty_on),
      duty_off: toApiCompatibleTime(state.editableReserveTemplate.duty_off),
      shift_type: rootGetters['scheduling/pairingTemplates/activeReserveTypeId'],
    };

    const model = state.editableReserveTemplate.id
      ? await api.patchReserveTemplate(apiReadyModel)
      : await api.postReserveTemplate(apiReadyModel);

    commit(consts.SET_EDITABLE_RESERVE_TEMPLATE, model);
    return dispatch('getTemplateChanges', model.id);
  },

  async getTemplateChanges({ commit, state }, id) {
    commit(consts.SET_CHANGES_LOADING, true);
    try {
      const changes = await api.getShiftTemplateChanges(id);
      commit(consts.SET_SHIFT_TEMPLATE_CHANGES, changes)
    } finally {
      commit(consts.SET_CHANGES_LOADING, false);
    }
  },

  async applyTemplateChanges({ commit, dispatch }, id) {
    commit(consts.SET_CHANGES_LOADING, true);
    try {
      await api.applyShiftTemplateChanges(id);
      return dispatch('getTemplateChanges', id);
    } finally {
      commit(consts.SET_CHANGES_LOADING, false);
    }
  },

  async deleteReserveTemplate({ commit, getters, state, rootGetters }, id) {
    await api.deleteReserveTemplate(id);

    if (state.editableReserveTemplate && (state.editableReserveTemplate.id === id))
      commit(consts.SET_EDITABLE_RESERVE_TEMPLATE, null);
  },
};

const mutations = {
  [consts.SET_EDITABLE_RESERVE_TEMPLATE](state, reserveTemplate) {
    state.editableTemplateChanges = [];
    state.editableReserveTemplate = reserveTemplate;
  },
  [consts.UPDATE_RESERVE_TEMPLATE](state, payload) {
    state.editableReserveTemplate = {
      ...state.editableReserveTemplate,
      ...payload
    };
  },
  [consts.SET_SHIFT_TEMPLATE_CHANGES](state, changes) {
    state.editableTemplateChanges = changes;
  },
  [consts.SET_CHANGES_LOADING](state, isLoading) {
    state.changesLoading = isLoading;
  },
};

export default loaderMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,

  modules: {
    [reserveTemplates]: createTableStore(reserveTemplatesTableApi),
    [trainingTemplates]: createTableStore(reserveTemplatesTableApi),
    [officeTemplates]: createTableStore(reserveTemplatesTableApi),
  },
});
