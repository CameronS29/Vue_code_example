<script>
  import { mapGetters, mapActions } from 'vuex';
  import LogLoading from '../../WB/LogView/LogLoading.vue';
  import LogNotFound from './NotFound/View.vue';

  export default {
    props: {
      logId: [Number, String],
    },

    data() {
      return {
        notFound: false,
      };
    },

    components: {
      LogLoading,
      LogNotFound,
    },

    computed: {
      ...mapGetters('flightlog', ['flightlog']),
      ...mapGetters('pilotManifest', ['inprogress', 'manifest']),

      loaded() {
        return this.manifest && this.flightlog && this.flightlog.id === parseInt(this.logId);
      },
    },

    created() {
      this.retrieveFlightLogData();
    },

    watch: {
      logId() {
        this.retrieveFlightLogData();
      },
    },
    methods: {
      ...mapActions('flightlog', ['getFlightLog']),

      retrieveFlightLogData() {
        this.notFound = false;
        this.getFlightLog(this.logId)
          .catch(() => { this.notFound = true; });
      },
    },
  };
</script>

<template>
  <div>
    <log-loading v-if="!loaded" />
    <log-not-found v-if="notFound" />
    <router-view v-if="loaded" />
  </div>
</template>

