import { omit, some } from 'lodash';
import Promise from 'bluebird';

import confirmationApi from '../../../api/wb/confirmation';
import { broadcastAction } from '../../../sockets';
import { STATUS_PIC_APPROVAL } from './consts';

import loadingMixin, { affectLoading } from '../../helpers/loading';

export const CLOSE_CONFIRMATION = 'CLOSE_CONFIRMATION';
export const OPEN_CONFIRMATION = 'OPEN_CONFIRMATION';
export const SET_CONFIRMATION_ERRORS = 'SET_CONFIRMATION_ERRORS';
export const REMOVE_ERROR = 'REMOVE_ERROR';
export const SET_PIN = 'SET_PIN';
export const SET_INITIALS = 'SET_INITIALS';
export const SET_PROGRESS = 'SET_PROGRESS';
export const RESET_CONFIRMATION = 'RESET_CONFIRMATION';
export const CLEAR_ERRORS = 'CLEAR_ERRORS';

const ROLE_MAP = {
  2: 'Pilot',
  3: 'Dispatch',
};


const state = {
  pin: '',
  initials: '',

  log: {},
  errors: {},
};

const getters = {
  pin: state => state.pin,
  initials: state => state.initials,
  log: state => state.log,

  opened: state => (state.log.id !== undefined),
  inprogress: state => state.inprogress,
  errors: state => state.errors,
  hasErrors: state => some(state.errors),

  roleDescription: (state, getters) => (
    getters.opened
      ? ROLE_MAP[state.log.status]
      : ''
  ),
  isDispatch: state => (state.log.status === STATUS_PIC_APPROVAL),
};

const actions = {
  @affectLoading
  async pushConfirmation({ commit, dispatch, getters }) {
    const { pin, initials, log: { id: logId } } = getters;
    const data = { pin, initials, wb_log: logId };

    try {
      await confirmationApi.sendConfirmation(data);
      commit(CLOSE_CONFIRMATION);
      commit(RESET_CONFIRMATION);

      return Promise.join(
        dispatch(broadcastAction(`wb:${logId}`, 'wb/updateWBLog'), { root: true }),
        dispatch('wb/updateWBLog', null, { root: true }),
      );
    } catch (e) {
      const { data, status } = e.response;

      // error should be propagated if it's not a validation
      if (status === 400) {
        commit(SET_CONFIRMATION_ERRORS, data);
      } else {
        throw e;
      }
    }
  },

  setPIN({ commit, state }, value) {
    commit(SET_PIN, value);
    if ('pin' in state.errors) {
      commit(REMOVE_ERROR, 'pin');
    }
  },

  setInitials({ commit, state }, value) {
    commit(SET_INITIALS, value);
    if ('initials' in state.errors) {
      commit(REMOVE_ERROR, 'initials');
    }
  },

  openConfirmation({ commit }, log) {
    commit(RESET_CONFIRMATION);
    commit(OPEN_CONFIRMATION, log);
  },

  closeConfirmation({ commit }) {
    commit(CLOSE_CONFIRMATION);
  },
};

const mutations = {
  [CLOSE_CONFIRMATION](state) {
    state.log = {};
  },
  [OPEN_CONFIRMATION](state, log) {
    state.log = log;
  },
  [SET_CONFIRMATION_ERRORS](state, errors) {
    state.errors = errors;
  },
  [SET_PROGRESS](state, progress) {
    state.inprogress = progress;
  },
  [SET_INITIALS](state, initials) {
    state.initials = initials;
  },
  [SET_PIN](state, pin) {
    state.pin = pin;
  },
  [REMOVE_ERROR](state, key) {
    state.errors = omit(state.errors, key);
  },
  [CLEAR_ERRORS](state) {
    state.errors = {};
  },
  [RESET_CONFIRMATION](state) {
    state.errors = {};
    state.initials = '';
    state.pin = '';
  },
};

export default loadingMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});
