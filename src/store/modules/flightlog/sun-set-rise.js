import without from 'lodash/without';
import pilotManifestApi from '../../../api/pilotManifest';
import {
  UPDATE_SUN_SET_RISE_DATA,
  SET_SUN_SET_RISE_LOADING,
  ADD_PENDING_SUN_SET_RISE_KEY,
  REMOVE_PENDING_SUN_SET_RISE_KEY,
  INC_CALC_NIGHT_TIME_FLAG,
} from './consts';

export default {
  namespaced: true,

  state: {
    data: {},
    pendingKeys: [],
    pending: false,
    calcNightTimeFlag: 0,
  },

  getters: {
    data: state => state.data,
    loading: state => state.pending,
    pendingKeys: state => state.pendingKeys,
    calcNightTimeFlag: state => state.calcNightTimeFlag,
  },

  actions: {
    getSunSetRiseInfo({commit}, {airport, date}) {
      const _key = `${airport}-${date}`;
      commit(SET_SUN_SET_RISE_LOADING, true);
      commit(ADD_PENDING_SUN_SET_RISE_KEY, _key);
      return pilotManifestApi.getSunSetRiseInfo(airport, date)
        .then((res) => {
          const data = {[_key]: res};
          commit(UPDATE_SUN_SET_RISE_DATA, data);
        }).finally(() => {
          commit(SET_SUN_SET_RISE_LOADING, false);
          commit(REMOVE_PENDING_SUN_SET_RISE_KEY, _key);
        });
    },

    setLog({commit}, log) {
      commit(SET_DELETE_LOG, log);
    },

    reset({commit}) {
      commit(RESET_DELETE_LOG);
    },
  },

  mutations: {
    [UPDATE_SUN_SET_RISE_DATA](state, data) {
      state.data = {
        ...state.data,
        ...data
      };
    },

    [SET_SUN_SET_RISE_LOADING](state, status) {
      state.pending = status;
    },

    [ADD_PENDING_SUN_SET_RISE_KEY](state, key) {
      state.pendingKeys = [...state.pendingKeys, key];
    },

    [REMOVE_PENDING_SUN_SET_RISE_KEY](state, key) {
      state.pendingKeys = without(state.pendingKeys, key);
    },

    [INC_CALC_NIGHT_TIME_FLAG](state) {
      state.calcNightTimeFlag = state.calcNightTimeFlag + 1;
    }
  },
};
