<script>
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import ManifestLoading from './ManifestLoading.vue';

  export default {
    components: {
      ManifestLoading,
    },
    props: {
      id: {
        type: [Number, String]
      }
    },
    computed: {
      ...mapGetters('pilotManifest', [
        'operations',
        'manifest',
        'availableAirports',
        'availableProfiles',
      ]),
      ...mapGetters('wb', [
        'availableAircrafts',
        'availableAircraftTypes'
      ]),
      loaded() {
        return this.manifest && this.manifest.id == this.id;
      }
    },
    methods: {
      ...mapActions('pilotManifest', [
        'getManifest',
        'getAvailableAirports',
        'getAvailableProfiles',
        'getFlightOptions',
        'getStatusLogs'
      ]),
      ...mapActions('wb', [
        'getAllOptions'
      ]),
    },
    watch: {
      id() {
        this.getManifest(this.id);
      }
    },
    created() {
      this.getManifest(this.id);
      if (this.availableAircrafts.length == 0) {
        this.getAllOptions();
      }
      if (this.operations.length == 0) {
        this.getFlightOptions();
      }
      if (this.availableAirports.length == 0) {
        this.getAvailableAirports();
      }
      if (this.availableProfiles.length == 0) {
        this.getAvailableProfiles();
      }
      if (this.id) {
        this.getStatusLogs(this.id);
      }
    }
  };
</script>

<template>
  <div>
    <router-view v-if="loaded"></router-view>
    <manifest-loading v-else></manifest-loading>
  </div>
</template>

<style>
</style>
