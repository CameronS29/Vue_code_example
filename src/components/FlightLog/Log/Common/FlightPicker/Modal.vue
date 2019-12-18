<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';

  import PickFlightModal from '../../../ManifestView/Update/PickFlight/Modal.vue';
  import EditFlightModal from '../../../ManifestView/Update/EditFlight/Modal.vue';

  export default {
    created() {
      if (this.availableAirports.length == 0) {
        this.getAvailableAirports();
      }
      if (this.operations.length == 0) {
        this.getFlightOptions();
      }
    },
    props: {
      wbFlights: {
        type: Boolean,
        default: false,
      },
    },
    components: {
      PickFlightModal,
      EditFlightModal,
    },
    computed: {
      ...mapGetters('pilotManifest', [
        'availableAirports',
        'operations',
      ]),
    },
    methods: {
      ...mapActions('pilotManifest', [
        'getAvailableAirports',
        'getFlightOptions',
      ]),
      handlePickScheduledFlight(flight_id) {
        this.$emit('input', flight_id);
      },
      handleCreateUnscheduledFlight(flight) {
        this.$emit('input', flight.id);
      },
    },
  };
</script>

<template>
  <div>
    <pick-flight-modal :create-log="false" @flight:picked="handlePickScheduledFlight"
                       :wb-flights="wbFlights" @wb-log-click="log => $emit('wb-log-click', log)" />
    <edit-flight-modal :create-log="false" @flight:updated="handleCreateUnscheduledFlight" />
  </div>
</template>

<style lang="scss">

</style>
