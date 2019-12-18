<script>
    import { mapGetters } from 'vuex';

    export default {
      computed: mapGetters('wb', [
        'availableAirports',
        'availableAircraftTypes',
        'availableFlights',
        'selectedAircraftType',
        'selectedAircraft',
        'selectedDeparture',
        'selectedArrival',
        'selectedDate',
        'log',
      ]),
    };
</script>

<template>
  <div class="panel panel-body">
    <div v-loading="availableAirports.length === 0">
      <div class="data-params">
        <div class="param">
          <div class="param-name">Aircraft</div>
          <div class="param-value">{{ selectedAircraft.registration }}</div>
        </div>
        <div class="param">
          <div class="param-name">Aircraft Type</div>
          <div class="param-value">{{ selectedAircraftType.name }}</div>
        </div>
        <div class="param">
          <div class="param-name">Origin</div>
          <div class="param-value">{{ selectedDeparture }}</div>
        </div>
        <div class="param">
          <div class="param-name">Destination</div>
          <div class="param-value">{{ selectedArrival }}</div>
        </div>
        <div class="param">
          <div class="param-name">Date</div>
          <div class="param-value">{{ selectedDate }}</div>
        </div>
        <div class="param">
          <div class="param-name">Flight</div>
          <div class="param-value">{{ log.flight ? log.flight_data.flight_number : log.flight_number }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../../../../../../scss/bs-variables";

  .data-params {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    margin-right: 20px;
    .param {
      &-name {
        font-weight: bold;
      }
      &-value {
        font-size: 16px;
      }
    }
  }

  @media (max-width: $screen-xs-max) {
    .data-params .param {
      flex: 0 0 100%;
      margin-bottom: 15px;

    }
  }
</style>
