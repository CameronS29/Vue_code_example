import createTableStore, { UPDATE_ITEM, DELETE_ITEM } from '../../factory/table';
import { wbLogs, manifestApi } from '../../../api/dispatch/dashboard';
import { STATUS_PIC_APPROVAL } from '../wb/consts';
import { STATUS_DISPATCH_PENDING } from '../flightlog/consts';

const statusMixin = status => ({
  actions: {
    updateItem({ commit }, item) {
      if (item.status === status) {
        commit(UPDATE_ITEM, item);
      } else {
        commit(DELETE_ITEM, item.id);
      }
    },
  },
});


export default {
  namespaced: true,
  modules: {
    pendingLogs: createTableStore(
      wbLogs,
      statusMixin(STATUS_PIC_APPROVAL),
    ),
    pendingManifests: createTableStore(
      manifestApi,
      statusMixin(STATUS_DISPATCH_PENDING),
    ),
    allManifests: createTableStore(manifestApi),
  },
};
