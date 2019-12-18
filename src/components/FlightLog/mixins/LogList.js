import {mapGetters, mapState, mapActions, mapMutations} from 'vuex';
import {DateTime} from 'luxon';

import * as consts from '../../../store/modules/flightlog/consts';
import Datepicker from '../../fields/Datepicker.vue';
import {LUXON_DATE_FORMAT} from "../../MXC/Engine/Swap/Mixins/Fields";
import moment from "moment/moment";

export default {
  props: ['startDate'],
  computed: {
    ...mapGetters('flightlog', [
      'flightlogs',
      'size',
      'isLoading',
      'total',
      'page',
      'selectedId',
    ]),
    ...mapState('flightlog', ['filters']),

    pageValue: {
      get() {
        return this.page;
      },
      set(value) {
        const oldValue = this.page;
        this[consts.SET_PAGE](value);
        if (oldValue !== value) {
          this.updateFlightLog();
        }
      },
    },

    sizeValue: {
      get() {
        return this.size;
      },
      set(value) {
        this[consts.SET_SIZE](value);
        this[consts.RESET_PAGE]();
        this.updateFlightLog();
      },
    },

    dateFrom: {
      get() {
        if (this.filters.actual_datetime_out_0) {
          return DateTime.fromISO(this.filters.actual_datetime_out_0).toUTC().toLocaleString(LUXON_DATE_FORMAT);
        }
        return undefined;
      },

      set(value) {
        value = value ? DateTime.fromString(value, LUXON_DATE_FORMAT, { zone: 'utc' }).toISO() : null;
        this[consts.SET_DATETIME_OUT_1](value);
        this[consts.RESET_PAGE]();
        this.updateFlightLog();
      },
    },

    aircraft: {
      get() {
        return this.filters.aircraft;
      },
      set(value) {
        this[consts.SET_AIRCRAFT_FILTER](value);
        this[consts.RESET_PAGE]();
        this.updateFlightLog();
      },
    },

    dateTo: {
      get() {
        if (this.filters.actual_datetime_out_1) {
          return DateTime.fromISO(this.filters.actual_datetime_out_1).toUTC().toFormat(LUXON_DATE_FORMAT);
        }
      },
      set(value) {
        value = value ? DateTime.fromString(value, LUXON_DATE_FORMAT``).toISO() : null;
        this[consts.SET_DATETIME_OUT_2](value);
        this[consts.RESET_PAGE]();
      },
    },
  },

  methods: {
    ...mapMutations('flightlog', [
      consts.SET_SIZE,
      consts.SET_PAGE,
      consts.SET_DATETIME_OUT_1,
      consts.SET_DATETIME_OUT_2,
      consts.SET_AIRCRAFT_FILTER,
      consts.SET_SELECTED_ID,
      consts.RESET_PAGE,
      consts.RESET_FILTERS,
    ]),

    ...mapActions('flightlog', ['updateFlightLog']),

    tableRowClassName(row) {
      return row.id === this.selectedId && 'positive-row';
    },
    setPage(val) {
      this.pageValue = val;
    },
    setSize(val) {
      this.sizeValue = val;
    },
    selectLog(log) {
      this.$emit('logSelected', log);
      this[consts.SET_SELECTED_ID](log.id);
    },
  },

  filters: {
    formatTime(time) {
      return moment(time).utc().format('MM/DD/YYYY HH:mm');
    },
  },

  mounted() {
    this.updateFlightLog();
  },
  watch: {
    dateTo() {
      this.updateFlightLog();
    },
  },

  components: {
    Datepicker,
  },
};
