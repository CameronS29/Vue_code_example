import { DateTime } from 'luxon';

export default {
  props: {
    log: {
      type: Object,
      default: () => ({}),
    },
  },

  computed: {
    commit() {
      return this.log.commit;
    },
    date() {
      return DateTime.fromISO(this.commit.committed_on)
        .toFormat('LL/dd yyyy');
    },
    time() {
      return DateTime.fromISO(this.commit.committed_on)
        .toFormat('T');
    },
  },
}
