<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';

  import Modal from 'Common/Modal.vue';
  import UnscheduledFlight from '../../../ManifestView/Update/PickFlight/UnscheduledFlight.vue';
  import EditFlightModal from '../../../ManifestView/Update/EditFlight/Modal.vue';

  export default {
    props: {
      active: {
        type: Boolean,
        default: true,
      },
    },
    created() {
      if (this.availableAirports.length == 0) {
        this.getAvailableAirports();
      }

      if (this.operations.length == 0) {
        this.getFlightOptions();
      }
    },
    components: {
      UnscheduledFlight,
      EditFlightModal,
      Modal,
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
      ...mapActions('pilotManifest/editFlight', [
        'reset',
      ]),
      handleCreateUnscheduledFlight(flight) {
        this.$emit('added', flight);
        this.reset();
      },
    },
  };
</script>

<template>
  <div class="add-unscheduled" v-if="active">
    <modal :show="true" @close="$emit('close')" transparent>
      <unscheduled-flight />
    </modal>

    <edit-flight-modal :create-log="false" @flight:updated="handleCreateUnscheduledFlight" />
  </div>
</template>

<style lang="scss">
  .add-unscheduled {

  }
</style>
