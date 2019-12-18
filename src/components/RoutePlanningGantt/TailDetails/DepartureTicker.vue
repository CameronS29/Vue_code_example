<script>
  import { DateTime } from 'luxon';

  export default {
    props: {
      to: {
        type: String,
        required: true,
      },
      na: {
        type: String,
        default: '',
      },
    },
    created() {
      this.startTicking();
    },
    destroyed() {
      this.stopTicking();
    },
    data() {
      return {
        ticker: null,
        diff: null,
      };
    },
    computed: {
      diffString() {
        const d = this.diff;

        if (!d || !this.isPositiveOffset) {
          return this.na;
        }

        return [
          d.days ? `${parseInt(d.days)}d` : undefined,
          d.hours ? `${parseInt(d.hours)}h` : undefined,
          d.minutes ? `${parseInt(d.minutes)}m` : undefined,
          d.seconds ? `${parseInt(d.seconds)}s` : undefined,
        ].join(' ');
      },
      isPositiveOffset() {
        const { seconds } = DateTime.fromISO(this.to)
          .diff(DateTime.utc(), ['seconds']);

        return seconds > 0;
      },
    },
    methods: {
      startTicking() {
        this.stopTicking();

        this.ticker = setInterval(this.tick, 1e3);
      },
      stopTicking() {
        if (this.ticker) {
          clearInterval(this.ticker);
        }
      },
      tick() {
        this.diff = DateTime.fromISO(this.to)
          .diff(DateTime.utc(), ['days', 'hours', 'minutes', 'seconds']);
      },
    },
    watch: {
      to: 'startTicking',
    },
  };
</script>

<template>
  <span class="time-ticker">
    {{ diffString }}
  </span>
</template>


<style lang="scss">

</style>
