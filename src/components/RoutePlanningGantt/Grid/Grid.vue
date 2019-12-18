<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { DateTime } from 'luxon';
  import { minBy, min, find } from 'lodash';

  import { BEFORE_FLIGHT, AFTER_FLIGHT } from 'store/modules/routeplanningGantt';
  import GanttTable from 'Common/GanttTable.vue';
  import Flight from '../Flight/BlockView.vue';
  import TailNumber from './TailNumber.vue';
  import SortControl from './SortControl.vue';

  export default {
    async created() {
      this.fetchGrid();

      if (!this.aircrafts.length) {
        this.getAircrafts();
      }
    },
    components: {
      Flight,
      GanttTable,
      TailNumber,
      SortControl,
    },
    computed: {
      ...mapState('routeplanningGantt', [
        'ganttTableRange',
        'flightAssignment',
        'filters',
        'sort',
        'lastAssigned',
        'isInSelectionMode',
        'selectedFlights',
        'detailedViewTailId',
        'isMainTabsExpanded',
      ]),
      ...mapGetters('routeplanningGantt', [
        'ganttDateRange',
        'grid',
        'gridStartDate',
        'isFlightAssignmentValid',
        'gridFullHeight',
        'fullHeight',
        'dynamicAreasHeight',
      ]),
      ...mapGetters('aircraft', [
        'aircrafts',
      ]),
      ganttTableStyle() {
        return {
          height: `${(this.dynamicAreasHeight > this.fullHeight)
            ? this.gridFullHeight
            : this.dynamicAreasHeight * this.gridFullHeight / this.fullHeight}px`,
        };
      },
      updateTrigger() {
        return !!this.flightAssignment * +new Date;
      },
    },
    methods: {
      ...mapActions('routeplanningGantt', [
        'fetchGrid',
        'assignFlight',
        'unAssignFlight',
      ]),
      ...mapMutations('routeplanningGantt', [
        'updateSort',
        'updateFilters',
        'setObservableDate',
        'setFlightAssignment',
        'setBatchRemoveRootFlight',
        'addToSelectedFlights',
        'removeFromSelectedFlights',
      ]),
      ...mapActions('aircraft', [
        'getAircrafts',
      ]),
      showPlus(flight) {
        if (this.isInSelectionMode) return false;

        const aircraft = flight.aircraft;
        return !!this.flightAssignment.aircraft && this.flightAssignment.aircraft !== aircraft.id;
      },
      showDelete() {
        return !this.isInSelectionMode;
      },
      showCheck() {
        return this.isInSelectionMode;
      },
      isSelected(flight) {
        return find(this.selectedFlights, { id: flight.id });
      },
      handlePlusClick(flight) {
        this.assignFlight(flight);
      },
      handleDeleteClick(flight) {
        this.unAssignFlight(flight);
      },
      handleCheckChange({ flight, flag }) {
        return flag
          ? this.addToSelectedFlights(flight)
          : this.removeFromSelectedFlights(flight);
      },
      handleBatchDeleteClick(flight) {
        this.setBatchRemoveRootFlight(flight);
      },
      handleRowClick(aircraft) {
        const rangeWithGantt = date => {
          return Math.abs(this.gantHoverPosition.dateTime.ts - DateTime.fromISO(date, { zone: 'UTC' }).ts);
        };
        const nearestFlight = minBy(aircraft.flights, (flight) => {
          return min([rangeWithGantt(flight.scheduled_departure), rangeWithGantt(flight.scheduled_arrival)]);
        });
        let flightAssignment = {};

        if (aircraft.flights.length) {
          const assignmentPosition =
            rangeWithGantt(nearestFlight.scheduled_departure) < rangeWithGantt(nearestFlight.scheduled_arrival)
              ? BEFORE_FLIGHT
              : AFTER_FLIGHT;

          flightAssignment = {
            aircraft: aircraft.aircraft.id,
            flight: nearestFlight,

            airport: assignmentPosition === BEFORE_FLIGHT
              ? nearestFlight.origin.id
              : nearestFlight.destination.id,
            dateTime: assignmentPosition === BEFORE_FLIGHT
              ? nearestFlight.scheduled_departure
              : nearestFlight.scheduled_arrival,

            assignmentPosition,
          };
        } else {
          flightAssignment = {
            aircraft: aircraft.aircraft.id,
            flight: null,

            airport: null,
            dateTime: this.filters.dateStart,

            assignmentPosition: AFTER_FLIGHT,
          };
        }

        this.setFlightAssignment(flightAssignment);
      },
      handleGanttHover(e) {
        this.gantHoverPosition = e;
      },
      rowClasses(row) {
        return {
          'aircraft-gantt-grid__row': true,
          'aircraft-gantt-grid__row_selected': this.flightAssignment.aircraft === row.aircraft.id,
          'aircraft-gantt-grid__row_selected-detailed': this.isMainTabsExpanded
          && (this.detailedViewTailId === row.aircraft.id),
        };
      },
      scrollToLastAddedFlight(flight) {
        const departure = DateTime.fromISO(flight.actual_datetime_out || flight.scheduled_departure);
        const arrival = DateTime.fromISO(flight.actual_datetime_in || flight.scheduled_arrival);
        const diff = arrival.diff(departure, 'minutes').minutes;

        this.$refs.ganttTable.scrollToDate({
          date: departure.plus({ minutes: diff / 2 }),
          animated: true,
          centred: true,
        });
      },
      scrollToNow() {
        this.$refs.ganttTable.scrollToDate({
          date: DateTime.local(),
          animated: true,
          centred: true,
        });
      },
      handleObservableDateChange(date) {
        this.setObservableDate(date.toISO());
      },
      changeSort(sort) {
        const currentSort = this.sort[sort];
        const nextSort = (currentSort === -1) ? 1 : currentSort - 1;

        this.updateSort({ [sort]: nextSort });
      },
    },
    watch: {
      lastAssigned: 'scrollToLastAddedFlight',
    },
  };
</script>

<template>
  <section class="aircraft-gantt-grid">
    <gantt-table
      ref="ganttTable"
      class="aircraft-gantt-grid__gantt-table"
      :style="ganttTableStyle"
      :range="ganttTableRange"
      :date-range="ganttDateRange"
      :default-date="gridStartDate"
      row-class="aircraft-gantt-grid__row"
      @date-change="handleObservableDateChange"
      @blocktime-wrapper-hover="handleGanttHover"
      :scroll-sync="{ id: 'routeplanning', y: false }"
      :update-trigger="updateTrigger"
      rich-header>
      <template slot="fixed-header">
        <div class="aircraft-gantt-grid__sorts">
          <div class="aircraft-gantt-grid__tail-sort">
            <sort-control :value="sort.tailNumber" @click="changeSort('tailNumber')" />
          </div>
          <div class="aircraft-gantt-grid__status-sort">
            <sort-control :value="sort.status" @click="changeSort('status')" />
          </div>
          <div class="aircraft-gantt-grid__hobbs-sort">
            <sort-control :value="sort.hobbs" @click="changeSort('hobbs')" />
          </div>
        </div>
      </template>
      <template slot="fixed">
        <div class="aircraft-gantt-grid__tail-number-list">
          <div :key="row.aircraft.id"
               v-for="row in grid"
               class="aircraft-gantt-grid__row_fixed"
               :class="rowClasses(row)">
            <tail-number :aircraft="row.aircraft" :flights="row.flights" />
          </div>
        </div>
      </template>

      <template slot="grid">
        <div :key="row.aircraft.id"
             v-for="row in grid"
             class="aircraft-gantt-grid__row_blocktimes"
             @click="handleRowClick(row)"
             :class="rowClasses(row)">
          <flight
            :show-plus="showPlus(row)"
            :show-delete="showDelete(row)"
            :show-check="showCheck(row)"
            :is-selected="isSelected(row)"
            color-coded
            @plus-click="handlePlusClick"
            @delete-click="handleDeleteClick"
            @check-change="handleCheckChange"
            @batch-delete-click="handleBatchDeleteClick"
            timeline-position
            :flight="flight"
            :key="flight.id"
            :is-last="row.lastFlightId === flight.id"
            :next-mx="row.nextMx"
            show-hobbs
            v-for="flight in row.flights" />
        </div>
      </template>
    </gantt-table>
  </section>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .aircraft-gantt-grid {
    &__tail-number-list {
      width: 215px;
    }
    &__row {
      height: 20px;
      position: relative;
      border: solid 2px transparent;
      border-bottom: 1px solid rgba(84, 84, 84, 0.1);
      cursor: pointer;
      &_fixed {
        border-right: none !important;
      }
      &_blocktimes {
        border-left: none !important;
      }
      &_selected {
        background: #deedf9 !important;
        border: solid 2px #6eb4ec;
      }
      &_selected-detailed {
        background: transparentize($navy, .9) !important;
        border: solid 2px $navy;
      }
    }

    &__sorts {
      display: flex;
      height: 25px;
      align-items: stretch;
      padding: 0 5px;
    }
    &__tail-sort {
      display: flex;
      flex: 0 0 50px;
      padding-left: 5px;
      align-items: center;
    }
    &__hobbs-sort {
      display: flex;
      flex: 0 0 85px;
      padding-left: 7px;
      align-items: center;
    }
    &__status-sort {
      flex: 1 1;
      display: flex;
      justify-content: flex-end;
      padding-right: 7px;
      align-items: center;
    }
  }
</style>
