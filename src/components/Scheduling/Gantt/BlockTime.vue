<script>
  import { mapMutations, mapActions } from 'vuex';
  import differenceInSeconds from 'date-fns/differenceInSeconds';
  import { SET_FLIGHT } from 'store/modules/flights';

  const SECONDS_IN_DAY = 60 * 60 * 24;

  export default {
    props: {
      block: {
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
        return differenceInSeconds(this.block.start, this.containerDateRange[0]) / SECONDS_IN_DAY;
      },
      endStartDiff() {
        return differenceInSeconds(this.block.end, this.block.start) / SECONDS_IN_DAY;
      },
      style() {
        return {
          left: `${this.daysToPercents(this.sectionStartDiff)}%`,
          width: `${this.daysToPercents(this.endStartDiff)}%`,
        };
      },
    },
    methods: {
      ...mapMutations('flights', [SET_FLIGHT]),
      ...mapActions('flights', ['fetchFlight', 'fetchFlightStatuses']),

      daysToPercents(days) {
        return 100 * days / this.daysInDateRange;
      },

      async showDetailView() {
        await this.fetchFlight(this.block.flight_id || this.block.id);
      },
    },
  };
</script>

<template>
  <div
    @click="showDetailView"
    :style="style"
    class="sched-gantt-block">
    {{ block.flight_number }}
    <div class="sched-gantt-block__enlarged">
      {{ block.flight_number }}
    </div>
  </div>
</template>

<style lang="scss">
  .sched-gantt-block {
    height: 16px;
    border-radius: 2px;
    font-size: 11px;
    text-align: center;
    line-height: 16px;
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: #2c4053;
    color: #fff;
    position: absolute;
    cursor: pointer;
    &:hover {
      overflow: visible;
      .sched-gantt-block__enlarged {
        display: block;
      }
    }
    &__enlarged {
      display: none;
      position: absolute;
      left: calc(50% - 30px);
      top: 0;
      height: 16px;
      border-radius: 2px;
      z-index: 20;
      width: 60px;
      background: #2c4053;
      pointer-events: none;
    }
  }
</style>
