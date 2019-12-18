import { store } from '../../app';
import { getList, addRecord, deleteRecordsByKeys } from './db';
import { retryRequests } from './index';

export const SET_ONLINE_STATUS = 'SET_ONLINE_STATUS';
export const SET_RECORDS = 'SET_RECORDS';
export const SET_RETRYING_REQUESTS = 'RETRYING_REQUESTS';
export const ADD_RECENT_SUCCESS_SYNCS = 'ADD_RECENT_SUCCESS_SYNCS';
export const REMOVE_RECENT_SUCCESS_SYNCS = 'REMOVE_RECENT_SUCCESS_SYNCS';
export const SET_CONFLICTS = 'SET_CONFLICTS';

const RECENT_SUCCESS_TIMEOUT = 3e3;

window.addEventListener('online', () => store.commit(`offline/${SET_ONLINE_STATUS}`, true));
window.addEventListener('offline', () => store.commit(`offline/${SET_ONLINE_STATUS}`, false));

const state = {
  onlineStatus: true,
  records: [],
  recentSuccessSyncs: [],
  retryingRequests: false,
  lastReqConflictsDetected: false,
};

const getters = {
  onlineStatus: state => state.onlineStatus,
};

const mutations = {
  [SET_ONLINE_STATUS](state, flag) {
    state.onlineStatus = flag;
  },
  [SET_RETRYING_REQUESTS](state, flag) {
    state.retryingRequests = flag;
  },
  [SET_RECORDS](state, records) {
    state.records = records;
  },
  [SET_CONFLICTS](state, flag) {
    state.lastReqConflictsDetected = flag;
  },
  [ADD_RECENT_SUCCESS_SYNCS](state, responses) {
    state.recentSuccessSyncs = [...state.recentSuccessSyncs, ...responses];
  },
  [REMOVE_RECENT_SUCCESS_SYNCS](state, responses) {
    const recordIds = responses.map(response => response.record.id);

    state.recentSuccessSyncs = state.recentSuccessSyncs.filter(response => recordIds.indexOf(response.record.id) == -1);
  },
};

const actions = {
  async syncRecords({ commit }) {
    commit(SET_RECORDS, await getList());
  },
  async addRecord({ commit, dispatch }, record) {
    await addRecord(record);
    await dispatch('syncRecords');
  },
  async retryRequests({ commit, dispatch }, { keys, reduce, force }) {
    commit(SET_RETRYING_REQUESTS, true);
    commit(SET_CONFLICTS, false);
    try {
      const responses = await retryRequests(keys, reduce, force);
      await dispatch('syncRecords');

      commit(SET_RETRYING_REQUESTS, false);
      commit(ADD_RECENT_SUCCESS_SYNCS, responses);
      setTimeout(() => commit(REMOVE_RECENT_SUCCESS_SYNCS, responses), RECENT_SUCCESS_TIMEOUT);
      return responses;
    } catch (e) {
      commit(SET_RETRYING_REQUESTS, false);

      if (e.response) {
        if (e.response.status == 409) {
          commit(SET_CONFLICTS, true);
        } else {
          await dispatch('removeRecords', keys);
        }

        throw e;
      }
    }
  },
  async removeRecords({ commit, dispatch }, keys) {
    await deleteRecordsByKeys(keys);
    await dispatch('syncRecords');
    commit(SET_CONFLICTS, false);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
