import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import { DateTime } from 'luxon';
import { groupBy } from 'lodash';
import { SET_SHOW_DUTY_FORM } from 'store/modules/fdt/calendar';
import timezones from '../../utils/timezones';


export default {
  data() {
    return { timezones };
  },

  computed: {
    ...mapGetters('pilots', {
      pilots: 'selectablePilots',
      pilot: 'pilot',
    }),

    ...mapState('fdt/calendar', ['showDutyForm']),
    ...mapGetters('fdt/calendar', [
      'date',
      'year',
      'month',
      'tz',
    ]),

    editablePilotId: {
      get() {
        return this.pilot.id;
      },
      set(pilotId) {
        if (pilotId) {
          this.$router.push({ params: { pilotId } });
        }
      },
    },

    editableDate: {
      get() {
        return this.date.toJSDate();
      },
      set(value) {
        this.setDate({ date: DateTime.fromJSDate(value) });
      },
    },

    editableTz: {
      get() {
        return this.tz;
      },
      set(value) {
        this.setTimezone(value);
      },
    },

    pilotActivityGroups() {
      const pilotGroups = groupBy(this.pilots, 'is_active');
      return [{
        label: 'Active Pilots',
        options: pilotGroups.true,
      }, {
        label: 'Inactive Pilots',
        options: pilotGroups.false,
      }];
    },

    dateButtonDisabled() {
      const now = DateTime.utc();
      return this.month === now.month && this.year === now.year;
    },
  },

  methods: {
    ...mapMutations('fdt/calendar', [SET_SHOW_DUTY_FORM]),
    ...mapActions('fdt/calendar', [
      'setDate',
      'setTimezone',
    ]),

    handleToggleDutyForm() {
      this[SET_SHOW_DUTY_FORM](!this.showDutyForm);
    },

    setCurrentDate() {
      const date = DateTime.local().setZone(this.tz).startOf('month');
      this.setDate({ date });
    },
  },

  watch: {
    date() {
      const { year, month } = this;
      this.$router.push({ params: { year, month } });
    },
  },
};
