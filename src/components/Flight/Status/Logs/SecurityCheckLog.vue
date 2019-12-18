<script>
  import { DateTime } from 'luxon';
  import { flag } from 'utils/permissions';

  export default {
    props: {
      log: {
        type: Object,
        default: () => ({})
      },
    },
    computed: {
      commit() {
        return this.log.commit;
      },
      author() {
        return this.log.commit && this.log.commit.author;
      },

      date() {
        return DateTime.fromISO(this.commit.committed_on)
          .toFormat('LL/dd yyyy');
      },
      time() {
        return DateTime.fromISO(this.commit.committed_on)
          .toFormat('T');
      },
      userName() {
        return this.author && `${this.author.first_name} ${this.author.last_name}`;
      },
      action() {
        return this.commit.security_checked ? 'submitted' : 'deleted';
      },
      canViewLog() {
        return this.commit.search_id && flag('show_security_dashboard', 'show_security_form')(this.$store);
      },
      logRouterName() {
        if (flag('show_security_dashboard')(this.$store)) {
          return 'security_view';
        }

        if (flag('show_security_form')(this.$store)) {
          return 'security_confirm';
        }
      }
    },
    methods: {
      goToLog() {

      },
    },
  };
</script>

<template>
  <div class="flight-status-log__event">
    <div class="flight-status-log__event-datetime">
      <span class="flight-status-log__event-date">{{ date }}</span>
      <span class="flight-status-log__event-time">{{ time }}</span>
    </div>
    <div class="flight-status-log__event-message">
      <strong>{{ userName }}</strong> {{ action }} security search form
      <br v-if="commit.security_checked" />
      <span v-if="commit.security_checked">
        <strong>Reason for search:</strong> {{commit.reason_for_search_verbose}},
        <strong> Internal Search Notes:</strong> {{commit.internal_check_notes}},
        <strong> External Search Notes:</strong> {{commit.external_check_notes}}
      </span>
    </div>
    <div class="flight-status-log__event-controls">
      <router-link
        v-if="canViewLog"
        :to="{ name: logRouterName, params: { id: commit.search_id }}"
      >
        <el-button
          size="mini"
          type="primary">
          View on Search Log
        </el-button>
      </router-link>
    </div>
  </div>
</template>
