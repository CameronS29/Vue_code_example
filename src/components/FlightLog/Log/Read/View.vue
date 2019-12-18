<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import TopPanel from './Partials/TopPanel.vue';
  import StatusBlock from '../Common/StatusBlock.vue';
  import CrewBlock from './Partials/Crew.vue';
  import FlightBlock from './Partials/Flight.vue';
  import PilotInput from './Partials/PilotInput.vue';

  export default {
    components: {
      TopPanel,
      StatusBlock,
      CrewBlock,
      FlightBlock,
      PilotInput
    },

    computed: {
      ...mapGetters('flightlog', [
        'flightlog',
      ]),
      ...mapGetters('pilotManifest', [
        'manifest'
      ]),
      dashboardPathName() {
        const { name } = this.$route;
        if (name.indexOf('dispatch_') > -1) {
          return 'dispatch_dashboard';
        } else if (name.indexOf('fsdo_') > -1) {
          return 'fsdo_dashboard';
        } else {
          return 'pilot_dashboard';
        }
      },
      canForceSync() {
        return this.dashboardPathName.indexOf('fsdo') == -1;
      },
      manifestPathName() {
        const { name } = this.$route;
        if (name.indexOf('dispatch_') > -1) {
          return 'dispatch_manifest_view';
        } else if (name.indexOf('fsdo_') > -1) {
          return 'fsdo_manifest';
        } else {
          return 'pilot_manifest_view';
        }
      },
      manifestEditPath() {
        const { name } = this.$route;
        if (name.indexOf('dispatch_') > -1) {
          return 'dispatch_manifest_edit';
        } else {
          return 'pilot_manifest_edit';
        }
      }
    },


    methods: {
      ...mapActions('flightlog', [
        'forceSync'
      ]),
      handleForceSync() {
        this.forceSync()
          .then(res=>{
            this.$router.push(
              {
                name: this.manifestEditPath,
                params: {id: this.flightlog.manifest.id}
              }
            );
          }).catch(_=>
            this.$notify({
              type: 'error',
              title: 'Force Sync(elog 1.0)',
              message: 'There was an error while syncing. Please try later...',
            })
          );
      }
    },
  };
</script>

<template>
  <div>
    <div class="wrapper wrapper-content animated fadeInRight log-view">
      <status-block></status-block>
      <div class="row">
        <div class="col col-lg-6">
          <crew-block></crew-block>
          <flight-block></flight-block>
        </div>
        <div class="col col-lg-6">
          <pilot-input></pilot-input>
        </div>
      </div>
      <div class="log-view__controls">
        <router-link
          :class="'btn btn-success btn-rounded log-view__controls-btn'"
          :to="{ name: manifestPathName, params: {id: flightlog.manifest.id}}"
          title="Manifest">
          Back to Flight Manifest
        </router-link>
        <router-link
          :class="'btn btn-black btn-rounded log-view__controls-btn'"
          :to="{ name: dashboardPathName }" title="Dashboard">
          Back to Dashboard
        </router-link>
        <button class="btn btn-black btn-rounded log-view__controls-btn"
            @click="handleForceSync" v-if="canForceSync">
          Force Sync (elog 1.0)
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .log-view {
    &__controls {
      display: flex;
      flex-flow: row wrap;
    }
    &__controls-btn {
      margin: 0 10px 10px 0;
    }
  }
</style>
