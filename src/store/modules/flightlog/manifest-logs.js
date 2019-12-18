import { DateTime } from 'luxon';
import { SET_MANIFEST_LOGS } from './consts';
import flightManifestAPI from '../../../api/flight-manifest';
import loaderMixin, { affectLoading } from 'store/helpers/loading';

const state = {
  logs: [],
};

const getters = {
  logs: state => state.logs,
  logsSorted: state => state.logs,
  OOOIOverlappedLogs: state => {
    const toDT = date => DateTime.fromISO(date);
    return (logId, dateRange) => {
      if (!(dateRange[0] && dateRange[1])) return [];

      const dateRanges = state.logs
        .filter(log => log.id !== logId)
        .filter(log => !log.open)
        .filter(log => log.actual_datetime_out && log.actual_datetime_in)
        .map(log => [log.actual_datetime_out, log.actual_datetime_in, log]);

      return dateRanges.reduce((acc, log) => {
        if (
          ((toDT(log[0]) > toDT(dateRange[0])) && (toDT(log[0]) > toDT(dateRange[1])))
          || ((toDT(log[1]) < toDT(dateRange[0])) && (toDT(log[1]) < toDT(dateRange[1])))
        ) {
          return acc;
        }

        return [...acc, log[2]];
      }, []);
    }
  }
};

const actions = {
  @affectLoading
  getManifestLogs({ commit }, manifest) {
    return flightManifestAPI.getManifestLogs(manifest).then(({ data }) =>
      commit(SET_MANIFEST_LOGS, data.results));
  },
};

const mutations = {
  [SET_MANIFEST_LOGS](state, logs) {
    state.logs = logs;
  },
};

export default loaderMixin({
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
});
