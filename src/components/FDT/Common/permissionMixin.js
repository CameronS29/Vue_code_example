import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters('fdt/calendar', [
      'isOnPublishedRevision',
    ]),

    ...mapGetters('user', [
      'user',
      'isAdmin',
      'isScheduler',
      'isDispatcher',
      'isPilot',
    ]),

    onlyPilot() {
      const { isPilot, isAdmin, isDispatcher, isScheduler } = this;
      return isPilot && !(isAdmin || isDispatcher || isScheduler);
    },

    onlyDispatch() {
      const { isScheduler, isDispatcher, isAdmin } = this;
      return isDispatcher && !(isScheduler || isAdmin);
    },
  },
};
