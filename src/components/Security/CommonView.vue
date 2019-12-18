<script>
  import { mapActions, mapGetters } from 'vuex';

  export default {
    computed: {
      ...mapGetters('security', [
        'reasons',
        'internalCheckList',
        'externalCheckList'
      ]),
      ...mapGetters('pilotManifest', [
        'availableProfiles',
        'availableAirports',
      ]),
      ...mapGetters('aircraft', [
        'aircrafts',
        'aircraftTypes'
      ]),
      loaded() {
        return  this.reasons.length > 0 && this.aircrafts.length > 0 &&
          this.aircraftTypes.length > 0 && this.availableProfiles.length > 0 && this.availableAirports.length > 0;
      }
    },

    methods: {
      ...mapActions('security', [
        'getSecurityOptions',
      ]),
       ...mapActions('pilotManifest', [
        'getAvailableProfiles',
        'getAvailableAirports',
      ]),
      ...mapActions('aircraft', [
        'getAircrafts',
        'getAircraftTypes',
      ]),
    },
    created() {
      if (this.reasons.length == 0) {
        this.getSecurityOptions();
      }
      if (this.aircraftTypes.length == 0) {
        this.getAircraftTypes();
      }
      if (this.aircrafts.length == 0) {
        this.getAircrafts();
      }
      if (this.availableProfiles.length == 0) {
        this.getAvailableProfiles();
      }
      if (this.availableAirports.length == 0) {
        this.getAvailableAirports();
      }
    },
  };
</script>

<template>
  <router-view v-if="loaded"></router-view>
</template>
