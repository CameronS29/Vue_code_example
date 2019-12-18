<script>
  import { DateTime } from 'luxon';

  export default {
    props: {
      datetime: String,
      estimated: {
        type: Boolean,
        default: false,
      },
    },

    computed: {
      parsed() {
        return DateTime.fromISO(this.datetime).setZone('UTC');
      },
      date() {
        return this.parsed.toFormat('MM/dd');
      },
      time() {
        return this.parsed.toLocaleString(DateTime.TIME_24_SIMPLE);
      },
    },
  };
</script>

<template>
  <span v-if="datetime" class="route-planning__date-time-cell">
    {{ date }} {{ time }}
    <span class="route-planning__eta-badge" v-if="estimated">ETA</span>
  </span>
</template>

<style lang="scss">
  .route-planning {
    &__eta-badge {
      position: relative;
      font-size: 0.6em;
      color: white;
      background: #e6a23c;
      border-radius: 4px;
      padding: 0 2px;
      line-height: 0;
    }
  }
</style>
