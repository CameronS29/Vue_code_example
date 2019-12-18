import loaderMixin, { affectLoading } from 'store/helpers/loading';
import { map } from 'lodash';
import { DateTime } from 'luxon';
import FixedOffsetZone from 'luxon/src/zones/fixedOffsetZone';
import fdtApi from 'api/fdt/legality';
import { LUXON_US_DATE_FORMAT } from 'store/modules/scheduling/consts';

const SET_ERRORS = 'SET_ERRORS';


export default loaderMixin({
  namespaced: true,

  state: {
    ocfs: [],
    editableOCF: {},
    errors: [],
  },

  actions: {
    @affectLoading
    async getOCFs({ commit, rootState, rootGetters }, { filters } = {}) {
      const pilot = rootState.pilots.pilot.id;
      const monthDate =  rootGetters['fdt/calendar/date'];
      const startDate = monthDate.startOf('month');
      const endDate = monthDate.endOf('month');

      const ocfs = await fdtApi.listOCF({
        ...filters,
        pilot,
        date_from: startDate.toISO(),
        date_to: endDate.toISO(),
      });

      commit('setOCFs', ocfs);
    },

    @affectLoading
    async saveOCF({ state, commit, dispatch, rootState }) {
      const pilot = rootState.pilots.pilot.id;
      const data = state.editableOCF;

      const action = data.id ? fdtApi.updateOCF : fdtApi.createOCF;
      await action({ pilot, ...data });

      return Promise.all([
        dispatch('getOCFs'),
        dispatch('fdt/calendar/getLegality', null, { root: true }),
      ]);
    },

    @affectLoading
    async deleteOCF({ dispatch, rootState, rootGetters }, id) {
      await fdtApi.deleteOCF(id);
      return Promise.all([
        dispatch('getOCFs'),
        dispatch('fdt/calendar/getLegality', null, { root: true }),
      ]);
    },

    @affectLoading
    async createOCFs({ commit, dispatch, rootState }, { date, data = [] }) {
      commit(SET_ERRORS, []);

      const pilot = rootState.pilots.pilot.id;
      const ocfs = map(data, ({ time: [timeOn, timeOff], night_landed }) => {
        const dtOn = DateTime.fromFormat(timeOn, 'HH:mm', { zone: FixedOffsetZone.utcInstance });
        const dtOff = DateTime.fromFormat(timeOff, 'HH:mm', { zone: FixedOffsetZone.utcInstance });

        return {
          pilot,
          night_landed,
          datetime_on: date.set({ hour: dtOn.hour, minute: dtOn.minute, second: 0 }),
          datetime_off: date.set({ hour: dtOff.hour, minute: dtOff.minute, second: 0 }),
        };
      });

      try {
        await fdtApi.createOCFInBulk({
          pilot,
          ocfs,
          date: date.toFormat(LUXON_US_DATE_FORMAT),
        });
        return dispatch('getOCFs');
      } catch (e) {
        commit(SET_ERRORS, e.response.data);
        throw e;
      }
    },
  },

  mutations: {
    [SET_ERRORS](state, errors) {
      state.errors = errors;
    },
    setOCFs(state, ocfs) {
      state.ocfs = ocfs;
    },
    setEditableOCF(state, ocf) {
      state.editableOCF = ocf;
    },
  },
});
