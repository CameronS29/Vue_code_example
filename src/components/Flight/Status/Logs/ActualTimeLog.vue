<script>
  import { DateTime } from 'luxon';
  import BaseMixin from "./BaseMixin";

  export default {
    props: {
      log: {
        type: Object,
        default: () => ({})
      },
    },
    mixins: [BaseMixin],
    computed: {
      author() {
        return this.log.commit.author;
      },
      userName() {
        return `${this.author.first_name} ${this.author.last_name}`;
      },
      prop() {
        if (this.commit.datetime_type === 0) {
          return 'Actual date/time OUT';
        } else if (this.commit.datetime_type === 1) {
          return 'Actual date/time IN';
        }

        return null;
      },
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
      <strong v-if="author">{{ userName }}</strong> updated {{ prop }} — <strong>UTC:</strong> {{ commit.datetime_value | longDT }},
      <strong>local:</strong> {{ commit.local_datetime | longDTTimezone }}
    </div>
    <div class="flight-status-log__event-controls">
      <router-link
        :to="{ name: 'dispatch_log_edit', params: { id: commit.manifest_id, logId: commit.flightlog_id }}"
      >
        <el-button
          size="mini"
          @click="goToLog"
          type="primary">
          View on Flightlog
        </el-button>
      </router-link>
    </div>
  </div>
</template>
