<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { sortBy } from 'lodash';

  import { AFTER_FLIGHT, BEFORE_FLIGHT } from 'store/modules/routeplanningGantt';
  import Flight from '../Flight/ListView.vue';

  export default {
    props: {
      aircraft: {
        type: Object,
        required: true,
      },
    },
    components: {
      Flight,
    },
    computed: {
      ...mapState('routeplanningGantt', [
        'flightAssignment',
      ]),
      ...mapGetters('routeplanningGantt', [
        'aircraftFullHeight',
        'fullHeight',
        'dynamicAreasHeight',
      ]),
      flights() {
        return sortBy(this.aircraft.flights, 'scheduled_departure');
      },
      style() {
        return {
          height: `${(this.dynamicAreasHeight > this.fullHeight)
            ? this.aircraftFullHeight
            : this.dynamicAreasHeight * this.aircraftFullHeight / this.fullHeight}px`,
        };
      },
    },
    methods: {
      ...mapMutations('routeplanningGantt', [
        'setFlightAssignment',
      ]),
      ...mapActions('routeplanningGantt', [
        'unAssignFlight',
      ]),
      handleAddNextClick(flight) {
        this.setFlightAssignment({
          aircraft: this.aircraft.aircraft.id,
          flight,

          airport: flight.destination.id,
          dateTime: flight.scheduled_arrival,

          assignmentPosition: AFTER_FLIGHT,
        });
      },
      handleRemoveClick(flight) {
        this.unAssignFlight(flight);
      },
      showFlightPlaceholder(flight) {
        const assignFlight = this.flightAssignment.flight;

        return assignFlight && (flight.id === assignFlight.id);
      },
      showAfterFlightPlaceholder(flight) {
        return this.showFlightPlaceholder(flight) && (this.flightAssignment.assignmentPosition === AFTER_FLIGHT);
      },
      showBeforeFlightPlaceholder(flight) {
        return this.showFlightPlaceholder(flight) && (this.flightAssignment.assignmentPosition === BEFORE_FLIGHT);
      },
    },
  };
</script>

<template>
  <div class="tail-detailed-tab" :style="style">
    <table class="tail-detailed-tab__flights">
      <thead>
        <tr>
          <th colspan="2" />
          <th>Scheduled</th>
          <th>Actual</th>
          <th>PIC</th>
          <th colspan="2">SIC</th>
          <th>Hobbs</th>
          <th colspan="2">Hobbs left</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="flight in flights">
          <tr v-if="showBeforeFlightPlaceholder(flight)">
            <td colspan="8">
              <div class="tail-detailed-tab__add-flight" />
            </td>
          </tr>
          <flight class="tail-detailed-tab__flight"
                  @click-add-next="handleAddNextClick(flight)"
                  @click-remove="handleRemoveClick(flight)"
                  :key="flight.id"
                  :flight="flight"
                  :aircraft="aircraft.aircraft"
          />
          <tr v-if="showAfterFlightPlaceholder(flight)">
            <td colspan="8">
              <div class="tail-detailed-tab__add-flight" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss">
  .tail-detailed-tab {
    overflow: auto;
    padding-bottom: 10px;

    &__flights {
      thead {
        color: #bab5b5;

      }
      th, td {
        font-weight: normal;
        padding: 1px 5px;
      }

      th {
        background: #fff;
        position: sticky;
        top: 0;
      }

    }
    &__add-flight {
      border: 2px dashed #6eb4ec;
      height: 20px;
    }
  }
</style>
