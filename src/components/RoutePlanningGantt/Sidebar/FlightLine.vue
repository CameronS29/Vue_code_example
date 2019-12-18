<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { sortBy, last } from 'lodash';
  import differenceInHours from 'date-fns/differenceInHours';

  import HorizontalScrollable from 'Common/HorizontalScrollable.vue';
  import { BEFORE_FLIGHT } from 'store/modules/routeplanningGantt';
  import Flight from '../Flight/BlockView.vue';

  export default {
    props: {
      line: {
        type: Object,
        required: true,
      },
    },
    components: {
      HorizontalScrollable,
      Flight,
    },
    computed: {
      ...mapState('routeplanningGantt', [
        'flightAssignment',
      ]),
      ...mapGetters('routeplanningGantt', [
        'flightsGroupedByFlightNumber',
      ]),
      flights() {
        let flights = [];
        const { unassigned, assigned } = this.flightsGroupedByFlightNumber;

        this.line.flight_numbers.forEach((fight_number) => {
          const assignedFlights = assigned[fight_number];
          const unassignedFlights = unassigned[fight_number];

          if (assignedFlights) {
            flights = [...flights, ...assignedFlights.map(flight => ({
              ...flight,
              assigned: true,
            }))];
          }

          if (unassignedFlights) {
            flights = [...flights, ...unassignedFlights.map(flight => ({
              ...flight,
              assigned: false,
            }))];
          }
        });

        return sortBy(flights, 'scheduled_departure')
          .filter((flight) => {
            let result = false;

            if (this.flightAssignment.assignmentPosition === BEFORE_FLIGHT) {
              const diff = differenceInHours(this.flightAssignment.dateTime, flight.scheduled_arrival);
              result = (diff > 0) && (diff <= 24);

              return result;
            }

            const diff = differenceInHours(flight.scheduled_departure, this.flightAssignment.dateTime);
            result = (diff > 0) && (diff <= 24);

            return result;
          });
      },
    },
    methods: {
      ...mapActions('routeplanningGantt', [
        'assignFlight',
        'assignFlights',
      ]),
      ...mapMutations('routeplanningGantt', [
        'setLastAssigned',
      ]),
      async handleArrowClick(flight) {
        await this.assignFlight(flight);
        await this.setLastAssigned(flight);
      },
      async handleAddAll() {
        const lastFlight = last(this.flights);
        const { flights } = this;

        await this.assignFlights({ flights });

        await this.setLastAssigned(lastFlight);
      },
    },
  };
</script>

<template>
  <div class="aircraft-gantt-line" v-if="flights.length">
    <header class="aircraft-gantt-line__header">{{ line.name }}</header>

    <div class="aircraft-gantt-line__flights">
      <horizontal-scrollable>
        <div class="aircraft-gantt-line__flights-wrapper">
          <flight class="aircraft-gantt-line__flight" show-plus date-time  mark-assigned
                  @plus-click="handleArrowClick"
                  v-for="flight in flights" :flight="flight" :key="flight.id" />
        </div>
      </horizontal-scrollable>
    </div>

    <div @click="handleAddAll" class="aircraft-gantt-line__add-btn">Add {{ flights.length }} flights</div>
  </div>
</template>

<style lang="scss">
  .aircraft-gantt-line {
    border-radius: 2px;
    border: solid 2px #e0dfdf;
    padding: 14px 8px 8px;
    position: relative;
    margin-top: 20px;
    &__header {
      color: #6a6a6a;
      font-weight: bold;
      position: absolute;
      left: 5px;
      top: -10px;
      padding: 0 2px;
      background: #fff;
      margin-bottom: 20px;
    }
    &__flights {

      &-wrapper {
        display: flex;
      }
    }
    &__flight {
      margin-right: 15px;
    }

    &__add-btn {
      border-radius: 2px;
      background-color: #17b394;
      color: #fff;
      position: absolute;
      right: 5px;
      padding: 0 5px;
      cursor: pointer;
    }
  }
</style>
