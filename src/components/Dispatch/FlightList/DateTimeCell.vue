<script>
  import { DateTime } from 'luxon';

  export default {
    props: [
      'datetime',
    ],
    computed: {
      parsed() {
        return DateTime.fromISO(this.datetime).setZone('UTC');
      },
      date() {
        return this.parsed.toFormat('MM/dd/yyyy');
      },
      time() {
        return this.parsed.toLocaleString(DateTime.TIME_24_SIMPLE);
      },
    },
  };
</script>

<template>
  <span v-if="datetime">{{ date }} {{ time }}</span>
</template>
