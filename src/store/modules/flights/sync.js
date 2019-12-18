import update from 'immutability-helper';
import filter from "lodash";
import flightListApi from '../../../api/dispatch/flight-list';

export const SET_FIELD = 'SET_FIELD';
export const ADD_SYNC = 'ADD_SYNC';
export const ADD_COMMIT = 'ADD_COMMIT';
export const SET_COMMITS = 'SET_COMMITS';
export const SET_SYNC_ID = 'SET_SYNC_ID';
export const SET_SYNCS = 'SET_SYNCS';
export const SET_PROGRESS = 'SET_PROGRESS';
export const PATCH_TASK_STATUS = 'PATCH_TASK_STATUS';

export default {
  namespaced: true,
  state: {
    form: {
      start: null,
      end: null
    },
    task: {
      id: null,
      status: null
    },
    commits: [],
    syncProgress: 1,
    syncStatus: "",
    syncInProgress: false,
    syncs: [],
    syncId: null
  },
  getters: {
    form: (state) => state.form,
    createdCommits: (state) => state.commits.filter(commit => commit.initial && commit.active),
    updatedCommits: (state) => state.commits.filter(commit => !commit.initial && commit.active),
    deactivated: (state) => state.commits.filter(commit => !commit.active),
  },
  actions: {
    async startSyncing({state, commit, dispatch}) {
      const task = await flightListApi.sync(state.form);
      commit(ADD_SYNC, task.sync);
      return task;
    },
    getSyncCommits({state, commit}, syncId) {
      commit(SET_SYNC_ID, syncId);
      return flightListApi.externalSyncCommits(syncId).then(commits => commit(SET_COMMITS, commits));
    },
    getExternalSyncs({state, commit}) {
      return flightListApi.externalSyncList().then(syncs => commit(SET_SYNCS, syncs));
    }
  },
  mutations: {
    [SET_FIELD](state, payload) {
      state.form = {
        ...state.form,
        ...payload,
      };
    },
    [SET_COMMITS](state, commits) {
      state.commits = commits;
    },
    [ADD_SYNC](state, sync) {
      state.syncs = [sync, ...state.syncs];
    },
    [ADD_COMMIT](state, commit) {
      state.commits = [commit, ...state.commits];
    },
    [SET_SYNCS](state, syncs) {
      state.syncs = syncs;
    },
    [SET_PROGRESS](state, {sync_progress, sync_status}) {
      state.syncProgress = sync_progress;
      state.syncStatus = sync_status;
      state.syncInProgress = true;
    },
    [SET_SYNC_ID](state, syncId) {
      state.syncId = syncId;
      state.syncInProgress = false
    },
    [PATCH_TASK_STATUS](state, task) {
      state.task = {
        ...state.task,
        ...task,
      };
    },
  },
};
