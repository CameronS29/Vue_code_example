import createTableStore, { UPDATE_ITEM, DELETE_ITEM } from 'store/factory/table';
import wbLogAPI from '../../../api/wb/log';
import * as consts from './consts';

const openFilter = ({ status }) => ([
  consts.STATUS_OPEN,
  consts.STATUS_READY_FOR_APPROVAL,
].indexOf(status) !== -1);

const pinnedFilter = log => !openFilter(log);

const filterTableMixin = filter => ({
  actions: {
    updateItem({ commit }, item) {
      if (!filter(item)) {
        commit(DELETE_ITEM, item.id);
      } else {
        commit(UPDATE_ITEM, item);
      }
    },
  },
});


export default {
  namespaced: true,
  modules: {
    openLogs: createTableStore(
      wbLogAPI,
      filterTableMixin(openFilter),
    ),
    completedLogs: createTableStore(
      wbLogAPI,
      filterTableMixin(pinnedFilter),
    ),
  },
};
