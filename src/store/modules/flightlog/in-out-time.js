import api from 'api/flight-log/in-out-time';
import { UPDATE_ITEM, DELETE_ITEM } from 'store/factory/table';

export const ONLINE_NAMESPACE = 'flightlog/in-out-time/online';
export const HISTORY_NAMESPACE = 'flightlog/in-out-time/history';

export default {
  namespaced: true,
  actions: {
    async approve({ commit }, id) {
      const record = await api.approve(id);

      commit(`${HISTORY_NAMESPACE}/${UPDATE_ITEM}`, record, { root: true });
      commit(`${ONLINE_NAMESPACE}/${DELETE_ITEM}`, id, { root: true });
    },
  },
};
