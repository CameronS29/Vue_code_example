import { get, omit } from 'lodash';
import { namespacedBroadcasters } from '../../../sockets';

const LOCK_LOG = 'LOCK_LOG';
const RELEASE_LOG = 'RELEASE_LOG';

const RELEASE_TIMEOUT = 4000;
const { broadcastAction } = namespacedBroadcasters('wb/locks');


export default {
  namespaced: true,

  state: {
    lockMap: {},
  },

  getters: {
    isLocked: state => logId => (logId in state.lockMap),
    lockUser: state => logId => get(state.lockMap[logId], 'user', ''),
  },

  actions: {
    lockLog({ dispatch, rootGetters }, logId) {
      const { first_name, last_name } = rootGetters['user/user'];
      const user = `${first_name} ${last_name}`;
      dispatch(broadcastAction('wb:locks', 'setLock', { logId, user }), { root: true });
    },

    releaseLog({ dispatch }, logId) {
      dispatch(broadcastAction('wb:locks', 'unsetLock', logId), { root: true });
    },

    setLock({ state, commit, dispatch }, { logId, user }) {
      clearTimeout(get(state.lockMap[logId], 'timer', -1));
      const timer = setTimeout(() => dispatch('unsetLock', logId), RELEASE_TIMEOUT);
      commit(LOCK_LOG, { [logId]: { user, timer } });
    },

    unsetLock({ state, commit }, logId) {
      clearTimeout(get(state.lockMap[logId], 'timer', -1));
      commit(RELEASE_LOG, logId);
    },
  },

  mutations: {
    [LOCK_LOG](state, lock) {
      state.lockMap = {
        ...state.lockMap,
        ...lock,
      };
    },

    [RELEASE_LOG](state, logId) {
      state.lockMap = omit(state.lockMap, logId);
    },
  },
};
