import { DateTime } from 'luxon';
import { mapGetters } from 'vuex';

export default {
  props: {
    block: { type: Object, required: true },
    day: { type: DateTime, required: true },
    overlaps: {
      type: Object,
      default: () => ({ left: false, right: false }),
    },
  },
  computed: {
    ...mapGetters('fdt/calendar', ['tz']),

    /**
     * DateTime object generated from block datetime off
     * @returns {DateTime}
     */
    momentOff() {
      return DateTime.fromISO(this.block.datetime_off).setZone(this.tz);
    },

    /**
     * DateTime object generated from block datetime on
     * @returns {DateTime}
     */
    momentOn() {
      return DateTime.fromISO(this.block.datetime_on).setZone(this.tz);
    },

    /**
     * DateTime object with beginning of given day or datetime on (whatever is greater)
     * @returns {computed.momentOn}
     */
    start() {
      if (this.momentOn.day !== this.day.day) {
        return this.day.startOf('day');
      }
      return this.momentOn;
    },

    /**
     * DateTime object with end of given day or datetime off (whatever is less)
     * @returns {computed.momentOn}
     */
    end() {
      if (this.momentOff.day !== this.day.day) {
        return this.day.endOf('day');
      }
      return this.momentOff;
    },

    lengthPercent() {
      return this.end.diff(this.start).as('days') * 100;
    },
    offset() {
      return this.start.diff(this.day.startOf('day')).as('days') * 100;
    },
    style() {
      return {
        width: `calc(${this.lengthPercent}% + 1px)`,
        left: `calc(${this.offset}% - 1px)`,
      };
    },
  }
};
