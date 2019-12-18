import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      blockTimerId: -1,
      blockLogId: undefined,
    };
  },

  destroyed() {
    clearInterval(this.blockTimerId);
    this.releaseLog(this.blockLogId);
  },

  computed: mapGetters('wb/confirmation', {
    confirmOpened: 'opened',
    confirmLog: 'log',
  }),

  methods: mapActions('wb/locks', [
    'lockLog',
    'releaseLog',
  ]),

  watch: {
    'confirmLog.id': function (newId) {
      this.blockLogId = newId || this.blockLogId;
    },

    confirmOpened(isOpened) {
      if (isOpened) {
        this.lockLog(this.blockLogId);
        this.blockTimerId = setInterval(() => this.lockLog(this.blockLogId), 1000);
      } else {
        clearInterval(this.blockTimerId);
        this.releaseLog(this.blockLogId);
      }
    },

    blockLogId(newLogId, oldLogId) {
      this.releaseLog(oldLogId);
      if (newLogId !== undefined) {
        this.lockLog(newLogId);
      }
    },
  },
};
