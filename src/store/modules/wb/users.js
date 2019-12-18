import forEach from 'lodash/forEach';
import has from 'lodash/has';
import { namespacedBroadcasters } from '../../../sockets';

const { broadcastAction } = namespacedBroadcasters('wb/users');
const ONLINE_TIMEOUT = 15000;

const SET_ON_LOG = 'SET_ON_LOG';
const SET_OFF_LOG = 'SET_OFF_LOG';
const CLEAR_USERS = 'CLEAR_USERS';


export default {
  namespaced: true,
  state: {
    users: [],
    userIds: {},
    timers: {},
  },

  getters: {
    users: ({ users }) => users,
  },

  actions: {
    shout({ dispatch }, { user, logId }) {
      const action = broadcastAction(`wb:${logId}`, 'setOnline', user);
      dispatch(action, { root: true });
    },

    shutUp({ dispatch }, { user, logId }) {
      const action = broadcastAction(`wb:${logId}`, 'setOffline', user.id);
      dispatch(action, { root: true });
    },

    setOnline({ commit, dispatch, rootGetters, }, user) {
      if (rootGetters['user/user'].id !== user.id) {
        const timerId = setTimeout(
          () => dispatch('setOffline', user.id),
          ONLINE_TIMEOUT,
        );
        commit(SET_ON_LOG, { user, timerId });
      }
    },

    setOffline({ commit, rootGetters }, userId) {
      if (rootGetters['user/user'].id !== userId) {
        commit(SET_OFF_LOG, userId);
      }
    },

    clearUsers({ commit }) {
      commit(CLEAR_USERS);
    },
  },

  mutations: {
    [SET_ON_LOG]({ users, userIds, timers }, { user, timerId }) {
      const { id: userId } = user;

      if (!has(userIds, userId)) {
        userIds[userId] = users.length;
        users.push(user);
      }

      clearTimeout(timers[userId]);
      timers[userId] = timerId;
    },

    [SET_OFF_LOG]({ users, userIds, timers }, userId) {
      if (has(userIds, userId)) {
        users.splice(userIds[userId], 1);
        delete userIds[userId];

        clearTimeout(timers[userId]);
        delete timers[userId];
      }
    },

    [CLEAR_USERS](state) {
      forEach(state.timers, timerId => clearTimeout(timerId));

      state.users = [];
      state.userIds = {};
      state.timers = {};
    },
  },
};
