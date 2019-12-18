<script>
  import differenceInSeconds from 'date-fns/differenceInSeconds';

  const SECONDS_IN_DAY = 60 * 60 * 24;

  export default {
    props: {
      shift: {
        type: Object,
        required: true,
      },
      containerDateRange: {
        type: Array,
        required: true,
      },
    },
    computed: {
      daysInDateRange() {
        const diff = differenceInSeconds(this.containerDateRange[1], this.containerDateRange[0]);
        return diff / SECONDS_IN_DAY;
      },
      sectionStartDiff() {
        return differenceInSeconds(this.shift.start, this.containerDateRange[0]) / SECONDS_IN_DAY;
      },
      endStartDiff() {
        return differenceInSeconds(this.shift.end, this.shift.start) / SECONDS_IN_DAY;
      },
      style() {
        return {
          left: `${this.daysToPercents(this.sectionStartDiff)}%`,
          width: `${this.daysToPercents(this.endStartDiff)}%`,
        };
      },
    },
    methods: {
      daysToPercents(days) {
        return 100 * days / this.daysInDateRange;
      },
    },
  };
</script>

<template>
  <div
    :style="style"
    class="sched-gantt-shift" />
</template>

<style lang="scss">
  .sched-gantt-shift {
    height: 16px;
    border-radius: 2px;
    background-color: #c8d9ea;
    position: absolute;
  }
</style>
