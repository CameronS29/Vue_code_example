<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { uniq, groupBy, values, keys } from 'lodash';

  import { statuses } from 'store/modules/flights/consts';

  export default {
    computed: {
      ...mapState('routeplanningGantt', [
        'filters',
        'isInSelectionMode',
        'selectedFlights',
      ]),
      flightCount() {
        return this.selectedFlights.length;
      },
      scheduledFlights() {
        return this.selectedFlights.filter((flight) => {
          return (flight.status !== statuses.CANCELED) && !flight.actual_aircraft;
        });
      },
      schedFlightsAircraftCount() {
        return this.aircraftIds(this.scheduledFlights).length;
      },
      scheduledFlightCount() {
        return this.scheduledFlights.length;
      },
      aircraftCount() {
        return this.aircraftIds(this.selectedFlights).length;
      },
      showSwapBtn() {
        return (this.schedFlightsAircraftCount === 2) && this.scheduledFlightCount;
      },
      swapMap() {
        return groupBy(this.scheduledFlights, this.filters.live ? 'assigned_aircraft' : 'draft_aircraft');
      },
    },
    methods: {
      ...mapMutations('routeplanningGantt', [
        'setSelectMode',
        'setSelectedFlights',
        'clearSelectedFlights',
      ]),
      ...mapActions('routeplanningGantt', [
        'assignFlights',
      ]),
      aircraftIds(flights) {
        return uniq(flights.map((flight) => {
          return flight.actual_aircraft || (this.filters.live ? flight.assigned_aircraft : flight.draft_aircraft);
        }));
      },
      dropSelection() {
        this.setSelectMode(false);
        this.clearSelectedFlights();
      },
      async handleSwapClick() {
        const flights = values(this.swapMap);
        const aircrafts = keys(this.swapMap).map(id => parseInt(id));

        await Promise.all([
          this.assignFlights({
            flights: flights[0],
            aircraft: aircrafts[1],
          }),
          this.assignFlights({
            flights: flights[1],
            aircraft: aircrafts[0],
          }),
        ]);

        this.clearSelectedFlights();
      },
    },
  };
</script>

<template>
  <div class="gantt-selection-controls">
    <div class="gantt-selection-controls__info">
      Selected <strong class="gantt-selection-controls__counter">{{ flightCount }}</strong> flights
      assigned to <strong class="gantt-selection-controls__counter">{{ aircraftCount }}</strong> aircrafts
    </div>
    <el-button @click="handleSwapClick" size="small" type="primary" :disabled="!showSwapBtn"
               icon="el-icon-refresh">
      Swap <strong>{{ scheduledFlightCount }}</strong> scheduled flights between aicrafts
    </el-button>
    <el-button @click="dropSelection"
               size="small" type="danger" icon="fa fa-fw fa-check-circle"> Drop Selection
    </el-button>
  </div>
</template>

<style lang="scss">
  .gantt-selection-controls {
    display: flex;
    align-items: center;

    > * {
      margin: 0 10px;
    }

    &__info {

    }
    &__counter {
      font-size: 16px;
    }
  }
</style>
