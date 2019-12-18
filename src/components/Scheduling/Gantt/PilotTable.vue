<script>
  import { mapState, mapGetters } from 'vuex';

  import GanttTable from 'Common/GanttTable.vue';
  import Shift from './Shift.vue';
  import BlockTime from './BlockTime.vue';

  export default {
    props: {
      isRoutePlanningEmbedded: {
        type: Boolean,
        default: false,
      },
      dateRange: {
        type: Array,
        required: true,
      },
      range: {
        type: Number,
        required: true,
      },
    },
    data() {
      return { highlightedRowIndex: null };
    },
    components: {
      Shift,
      BlockTime,
      GanttTable,
    },
    computed: {
      ...mapGetters('scheduling/gantt', ['filteredList', 'isLoading']),
      ...mapGetters('scheduling/calendar', ['UTCDate']),
      ...mapGetters('routeplanningGantt', [
        'pilotList',
        'ganttDateRange',

        'pilotGridFullHeight',
        'fullHeight',
        'dynamicAreasHeight',
      ]),
      style() {
        const standaloneStyles = {
          maxHeight: 'calc(100vh - 110px)',
        };

        const embeddedStyles = {
          height: `${(this.dynamicAreasHeight > this.fullHeight)
            ? this.pilotGridFullHeight
            : this.dynamicAreasHeight * this.pilotGridFullHeight / this.fullHeight}px`,
        };

        return this.isRoutePlanningEmbedded ? embeddedStyles : standaloneStyles;
      },
      gridData() {
        return this.isRoutePlanningEmbedded ? this.pilotList : this.filteredList;
      },
    },
  };
</script>

<template>
  <gantt-table
    :range="range"
    :date-range="dateRange"
    class="sched-gantt-table__gantt-table"
    row-class="sched-gantt-table__row"
    :style="style"
    :scroll-sync="isRoutePlanningEmbedded ? { id: 'routeplanning', y: false } : false"
    :hidden-header="isRoutePlanningEmbedded"
    v-loading="isLoading">
    <template slot="fixed">
      <div>
        <div
          :key="pilot.id"
          v-for="pilot in gridData"
          class="sched-gantt-table__row sched-gantt-table__row_pilot">
          {{ pilot.name }}
          <span class="gantt-table__base">{{ pilot.base }}</span>
        </div>
      </div>
    </template>
    <template slot="grid">
      <div
        :key="pilot.id"
        v-for="pilot in gridData"
        class="sched-gantt-table__row">
        <shift
          :key="shift.id"
          v-for="shift in pilot.shifts"
          :container-date-range="dateRange"
          :shift="shift" />
        <block-time
          :key="block.id"
          v-for="block in pilot.blocks"
          :container-date-range="dateRange"
          :block="block" />
      </div>
    </template>
  </gantt-table>
</template>

<style lang="scss">
  .sched-gantt-table {
    &__gantt-table {
      font-size: 12px;
    }
    &__row {
      display: flex;
      position: relative;
      height: 20px;
      align-items: center;
      overflow-x: hidden;
      &_pilot {
        justify-content: space-between;
        padding: 0 5px;
        width: 215px;
      }
    }
  }
</style>
