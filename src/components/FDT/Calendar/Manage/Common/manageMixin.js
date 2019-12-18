import { mapState, mapGetters, mapMutations } from 'vuex';
import { DateTime } from 'luxon';
import { SET_SHOW_DUTY_FORM } from 'store/modules/fdt/calendar';
import { formatDateTime } from 'components/Reports/utils';
import { FlightTypes, FlightTypeNames } from 'store/modules/fdt/consts';

export default {
  props: {
    pilot: { type: Number, required: true },
  },

  async created() {
    await this.updateDuties();
  },

  computed: {
    ...mapState('fdt/calendar', ['showDutyForm']),
    ...mapGetters('fdt/calendar', ['date']),
  },

  methods: {
    ...mapMutations('fdt/calendar', [SET_SHOW_DUTY_FORM]),

    handleCloseDutyForm() {
      this[SET_SHOW_DUTY_FORM](false);
    },

    flightTagType({ type }) {
      switch (type) {
        case FlightTypes.Scheduled: return 'success';
        case FlightTypes.Unscheduled: return 'default';
        case FlightTypes.Part91: return 'warning';
        default: return 'danger';
      }
    },

    flightTagName({ type }) {
      switch (type) {
        case FlightTypes.Scheduled:
        case FlightTypes.Unscheduled:
        case FlightTypes.Part91:
          return FlightTypeNames[type];
        default:
          return 'OCF';
      }
    },

    dutyTagType({ type }) {
      return {
        0: 'default',
        1: 'success',
        2: 'warning',
        3: 'danger',
      }[type] || 'info';
    },

    dutyTagName({ type }) {
      return {
        0: 'RESERVE',
        1: 'OFFICE',
        2: 'TRAINING',
        3: 'TRAVEL',
      }[type] || 'UNTYPED';
    },
  },

  filters: {
    format: formatDateTime,
  },

  watch: {
    pilot: 'updateDuties',
    date: 'updateDuties',
    showDutyForm: 'updateDuties',
  },
};

export const gmTime = {
  get: dt => DateTime.fromISO(dt, { setZone: true }).setZone('local', { keepLocalTime: true }).toJSDate(),
  set: dt => DateTime.fromJSDate(dt).setZone('utc', { keepLocalTime: true }).toISO(),
};
