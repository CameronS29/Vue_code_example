<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { find } from 'lodash';

  import IataField from 'Common/Form/Fields/AirportIATAField.vue';
  import Flight from './Flight.vue';

  export default {
    components: {
      IataField,
      Flight,
    },
    data() {
      return {
        base: [],
        searchQuery: null,
      };
    },
    computed: {
      ...mapState('routeplanningGantt/lines', [
        'lines',
        'flights',
      ]),
      ...mapGetters('routeplanningGantt/lines', [
        'activeLine',
      ]),
      filteredFlights() {
        return this.flights
          .filter(flight => {
            if (this.searchQuery && flight.flight_number.indexOf(this.searchQuery) === -1) {
              return false;
            }

            if (this.base.length
              && (this.base.indexOf(flight.origin) === -1)
              && (this.base.indexOf(flight.destination) === -1)) {
              return false;
            }

            if (find(this.activeLine.flight_numbers, flight_number => flight_number == flight.flight_number)) {
              return false;
            }

            return true;
          });
      },
    },
    methods: {
      ...mapActions('routeplanningGantt/lines', [
        'getLines',
        'addFlightToActiveLine',
      ]),
      handleAddFlight(flight) {
        this.addFlightToActiveLine(flight);
      },
    },
  };
</script>

<template>
  <div class="lines-flight-addition">
    <div class="lines-flight-addition__filters">
      <iata-field :control-props="{ size: 'mini' }" v-model="base" class="lines-flight-addition__base-filter" />
      <el-input
        suffix-icon="el-icon-search"
        v-model="searchQuery"
        size="mini" />
    </div>
    <div class="lines-flight-addition__list">
      <flight :add-btn="true" :flight="flight" @add-click="handleAddFlight"
              :key="flight.flight_number" v-for="flight in filteredFlights" />
    </div>
  </div>
</template>

<style lang="scss">
  .lines-flight-addition {
    display: flex;
    padding: 20px 20px 20px 0;
    &__filters {
      width: 240px;
      flex: 0 0 240px;
      padding: 5px 20px;
    }
    &__base-filter {
      margin-bottom: 10px;
    }
    &__list {
      display: flex;
      flex-flow: row wrap;
    }
  }
</style>
