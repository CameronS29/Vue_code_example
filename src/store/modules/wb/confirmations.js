import { last, filter } from 'lodash';
import confirmationApi from '../../../api/wb/confirmation';

export const RETRIEVE_CONFIRMATIONS = 'RETRIEVE_CONFIRMATIONS';

const PIC_PIN_STATUS = 'Dispatch Pending';
const DISPATHC_ACCEPT_STATUS = 'Completed';


const state = {
  confirmations: [],
};

const getters = {
  confirmations: state => state.confirmations,
  PICConfirmation: state => (
    last(filter(state.confirmations, { status: PIC_PIN_STATUS }))
  ),
  dispatchConfirmation: state => (
    last(filter(state.confirmations, { status: DISPATHC_ACCEPT_STATUS }))
  ),
};

const actions = {
  getConfirmations({ commit }, wbLog) {
    return confirmationApi.listConfirmations(wbLog)
      .then(data => commit(RETRIEVE_CONFIRMATIONS, data));
  },
};

const mutations = {
  [RETRIEVE_CONFIRMATIONS](state, confirmations) {
    state.confirmations = confirmations;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
