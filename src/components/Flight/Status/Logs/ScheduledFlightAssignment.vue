<script>
  import BaseMixin from './BaseMixin';

  export default {
    name: 'ScheduledFlightAssignment',
    mixins: [BaseMixin],
  };
</script>

<template>
  <div class="flight-status-log__event">
    <div class="flight-status-log__event-datetime">
      <span class="flight-status-log__event-date">{{ date }}</span>
      <span class="flight-status-log__event-time">{{ time }}</span>
    </div>
    <div class="flight-status-log__event-message">
      <strong>{{ commit.author }}</strong>
      scheduled <strong>{{ commit.pic }}</strong> as PIC
      <span v-if="commit.sic">
        and <strong>{{ commit.sic }}</strong> as SIC
      </span>
    </div>
  </div>
</template>
