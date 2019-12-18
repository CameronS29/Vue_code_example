import { mapActions, mapGetters } from 'vuex';

export default {
  data() {
    return {
      shoutTimer: -1,
      shoutLogId: undefined,
    };
  },

  computed: {
    ...mapGetters('user', ['user']),
    ...mapGetters('wb/users', [
      'users',
    ]),
  },

  methods: {
    ...mapActions('wb/users', [
      'shout',
      'shutUp',
      'clearUsers',
    ]),

    declareMyself() {
      clearTimeout(this.shoutTimer);
      this.shoutTimer = setTimeout(this.declareMyself, 5000);
      this.shout({ user: this.user, logId: this.shoutLogId });
    },

    leaveLog() {
      clearTimeout(this.shoutTimer);
      this.shutUp({ user: this.user, logId: this.shoutLogId });
    },
  },

  watch: {
    'log.id'(newId) {
      this.shoutLogId = newId || this.shoutLogId;
    },

    shoutLogId(newId, oldId) {
      this.shutUp({ user: this.user, logId: oldId });
      this.shout({ user: this.user, logId: newId });
    },
  },
};
