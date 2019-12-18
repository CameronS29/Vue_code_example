<script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import { find, get } from 'lodash';
  import { queryGetter } from 'utils/routers';

  import ViewPortal from 'Common/ViewPortal.vue';
  import GanttTable from 'Common/GanttTable.vue';
  import { CURRENT_DATETIME } from 'store/modules/reports/delay-gantt';

  import BlockTime from './Blocktime.vue';
  import BaseRow from './Base.vue';

  import FlightDetails from '../../../Flight/Status/FlightDetails.vue';
  import { timeZones } from '../../utils';

  export default {
    created() {
      this.getReportData();
    },

    components: {
      ViewPortal,
      FlightDetails,
      GanttTable,
      BlockTime,
      BaseRow,
    },

    data() {
      return {
        observableDate: CURRENT_DATETIME,
        highlightedRowIndex: null,
      };
    },

    computed: {
      ...mapState('reports/delay-gantt', ['range', 'weekDateRange', 'zone']),
      ...mapGetters('reports/delay-gantt', [
        'weekStartDate',
        'weekEndDate',
        'isLoading',
        'records',
        'minuteOffset',
        'flightPlacementMap',
      ]),

      groupBy: queryGetter('groupby', 'station'),

      ganttTableDateRange() {
        return [
          this.weekStartDate.toISO(),
          this.weekEndDate.toISO(),
        ];
      },

      observableDateString() {
        return this.observableDate.toISO().slice(0, 10);
      },

      selectedZone() {
        return get(find(timeZones, { offset: this.zone }), 'name', '');
      },

      displayOptions() {
        const { range } = this;
        return {
          displayTime: range <= 0.5,
          displayDelay: range <= 0.5,
          displayOrigin: range <= 0.65 && this.groupBy === 'tail',
          displayDestination: range <= 0.65,
        };
      },
    },
    methods: {
      ...mapActions('reports/delay-gantt', ['fetch']),

      getReportData() {
        return this.fetch(this);
      },
      handleObservableDateChange(date) {
        this.observableDate = date;
      },
    },

    watch: {
      weekDateRange: 'getReportData',
      groupBy: 'getReportData',
    },
  };
</script>

<template>
  <section class="delay-gantt">
    <gantt-table :range="range"
                 :date-range="ganttTableDateRange"
                 :default-date="observableDate"
                 :minute-offset="minuteOffset"
                 row-class="delay-gantt__row"
                 class="delay-gantt__gantt-table"
                 @date-change="handleObservableDateChange"
                 v-loading="isLoading"
                 hour-pads
                 rich-header>
      <template slot="hour" slot-scope="scope">
        <span v-if="range <= 0.7">{{ selectedZone }}</span>
      </template>

      <template slot="fixed">
        <div :key="row.base"
             v-for="row in flightPlacementMap"
             class="delay-gantt__row">
          <base-row :observable-date="observableDateString" :base="row" />
        </div>
      </template>

      <template slot="grid">
        <div :key="row.base"
             v-for="row in flightPlacementMap"
             class="delay-gantt__row">
          <div class="delay-gantt__row-level"
               :key="index"
               v-for="(level, index) in row.levels">
            <block-time :flight="flight"
                        :options="displayOptions"
                        :key="flight.id"
                        v-for="flight in level" />
          </div>
        </div>
      </template>
    </gantt-table>

    <flight-details />
  </section>
</template>


<style lang="scss">

  .delay-gantt {
    &__gantt-table {
      max-height: calc(100vh - 70px);
    }
    &__row {
      display: flex;
      position: relative;
      flex-flow: column;
      border-bottom: 1px solid rgba(84, 84, 84, 0.1);
    }
    &__row-level {
      height: 30px;
      position: relative;
      margin-bottom: 1px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
</style>
