import api, { tableApi } from 'api/feedback';
import createTableStore from 'store/factory/table';
import { pickBy } from 'lodash';

export const SET_FEEDBACK = 'SET_FEEDBACK';
export const SET_ACTIVE_RECORD = 'SET_ACTIVE_RECORD';
export const SET_SCENARIO_MODAL_SHOW_FLAG = 'SET_SCENARIO_MODAL_SHOW_FLAG';
export const SET_PLAIN_MESSAGE_MODAL_SHOW_FLAG = 'SET_PLAIN_MESSAGE_MODAL_SHOW_FLAG';
export const SET_NOTES_ADDITION_MODE_FLAG = 'SET_NOTES_ADDITION_MODE_FLAG';
export const UPDATE_PLAIN_MESSAGE_FORM = 'UPDATE_PLAIN_MESSAGE_FORM';
export const ADD_NOTE = 'ADD_NOTE';
export const REMOVE_NOTE = 'REMOVE_NOTE';
export const RESET_NOTES = 'RESET_NOTES';
export const TOGGLE_NOTES = 'TOGGLE_NOTES';
export const SET_LOADING = 'SET_LOADING';

export default {
  namespaced: true,
  state: {
    list: [],
    activeRecord: null,
    isScenarioModalShown: false,
    isPlainMessageModalShown: false,
    isInNotesAdditionMode: false,
    showNotes: true,
    notes: [],
    loading: false,
    plainMessageForm: {
      message: '',
    },
  },
  getters: {
    plainMessageForm: state => state.plainMessageForm,
  },
  mutations: {
    [SET_FEEDBACK](state, list) {
      state.list = list;
    },
    [SET_ACTIVE_RECORD](state, record) {
      state.activeRecord = record;
    },
    [SET_SCENARIO_MODAL_SHOW_FLAG](state, flag) {
      state.isScenarioModalShown = flag;
    },
    [SET_PLAIN_MESSAGE_MODAL_SHOW_FLAG](state, flag) {
      if (flag) state.isScenarioModalShown = false;
      state.isPlainMessageModalShown = flag;
    },
    [SET_NOTES_ADDITION_MODE_FLAG](state, flag) {
      if (flag) state.isScenarioModalShown = false;
      state.isInNotesAdditionMode = flag;
    },
    [UPDATE_PLAIN_MESSAGE_FORM](state, payload) {
      state.plainMessageForm = {
        ...state.plainMessageForm,
        ...payload
      };
    },
    [ADD_NOTE](state, payload) {
      state.notes = [...state.notes, payload];
    },
    [REMOVE_NOTE](state, index) {
      state.notes = state.notes.filter((note, key) => key !== index);
    },
    [RESET_NOTES](state) {
      state.notes = [];
    },
    [TOGGLE_NOTES](state) {
      state.showNotes = !state.showNotes;
    },
    [SET_LOADING](state, status) {
      state.loading = status;
    },
  },
  actions: {
    async leaveFeedback({ rootState }, payload) {
      let screenshot = null;
      if (payload.screenShot) {
        const { id: screenshotId } = await api.uploadScreenShot(payload.screenShot);
        screenshot = screenshotId;
      }

      await api.leaveFeedback({
        ...pickBy(payload, (value, key) => key !== 'screenShot'),
        screenshot,
        user: rootState.user.user.id,
      });
    },
    async fetchFeedbackList({ commit }) {
      const list = await api.getFeedbackList();
      commit(SET_FEEDBACK, list);
    },
    async fetchFeedbackRecord({ commit }, id) {
      const record = await api.getFeedbackRecord(id);
      commit(SET_ACTIVE_RECORD, record);
    },
  },
  modules: {
    table: createTableStore(tableApi),
  },
};
