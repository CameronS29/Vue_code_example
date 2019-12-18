import { keyBy } from 'lodash';
import userApi from 'api/user';

export const RECEIVE_USER = 'RECEIVE_USER';
export const RECEIVE_FLAGS = 'RECEIVE_FLAGS';

export default {
  namespaced: true,
  state: {
    user: {},
    flags: {},
  },

  getters: {
    user: ({ user }) => user,
    flags: ({ flags }) => flags,

    isSuperUser: ({ user }) => user.is_superuser,
    isAdmin: ({ user }, { isSuperUser }) => (user.is_admin || isSuperUser),
    isDispatcher: ({ user }, { isAdmin }) => (user.is_dispatcher || isAdmin),
    isScheduler: ({ user }, { isAdmin }) => (user.is_scheduler || isAdmin),
    isPIC: ({ user }, { isAdmin }) => (user.is_pic || isAdmin),
    isSIC: ({ user }, { isAdmin }) => (user.is_sic || isAdmin),
    isPilot: (_, { isPIC, isSIC }) => (isPIC || isSIC),
    isFSDO: ({ user }, { isAdmin }) => (user.is_fsdo || isAdmin),
    isSecurity: ({ user }, { isAdmin }) => (user.is_security || isAdmin),
    fullName: ({ user }) => `${user.first_name} ${user.last_name}`,
    avatar: ({ user }) => user.avatar,
  },

  actions: {
    async getUser({ commit }) {
      const user = await userApi.getUserInfo();
      commit(RECEIVE_USER, user);
    },

    async getFlags({ commit }) {
      const flags = await userApi.getWaffleFlags();
      commit(RECEIVE_FLAGS, flags);
    },
  },

  mutations: {
    [RECEIVE_USER](state, user) {
      state.user = user;
    },
    [RECEIVE_FLAGS](state, flags) {
      state.flags = keyBy(flags, 'name');
    },
  },
};
