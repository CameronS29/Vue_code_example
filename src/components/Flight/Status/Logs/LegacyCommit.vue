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
    methods: {
      goToLog() {

      },
    },
  };
</script>
§
<template>
  <div class="flight-status-log__event">
    <div class="flight-status-log__event-datetime">
      <span class="flight-status-log__event-date">{{ date }}</span>
      <span class="flight-status-log__event-time">{{ time }}</span>
    </div>
    <div class="flight-status-log__event-message">
      Legacy commit recorded
    </div>
  </div>
</template>
