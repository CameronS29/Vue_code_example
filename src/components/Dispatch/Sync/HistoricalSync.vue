<script>
  import {mapActions, mapGetters, mapState, mapMutations} from "vuex";
  import Icon from "Common/Icon.vue";
  import Commit from "./Parials/Commit.vue";
  import {SET_FLIGHT} from "../../../store/modules/flights";
  import {connectMixin} from "../../../sockets";
  import ElProgress from "element-ui/packages/progress/src/progress";

  export default {
    name: "historical-sync",
    props: ["id"],
    mixins: [
      connectMixin(({ id }) => (id && `sync:${id}`)),
    ],
    computed: {
      ...mapState("flights/sync", [
        'syncs',
        'syncId',
        'commits',
        'syncStatus',
        'syncProgress',
        'syncInProgress',
      ]),
      ...mapGetters("flights/sync", [
        'createdCommits',
        'updatedCommits',
        'deactivated',
      ]),
      syncProgressRounded() {
        return Math.round(this.syncProgress*100);
      }
    },
    components: {
      Icon,
      Commit,
      ElProgress
    },
    methods: {
      ...mapMutations('flights', [SET_FLIGHT]),
      ...mapActions('flights', ['fetchFlightStatuses']),
      ...mapActions("flights/sync", ["startSyncing", "getExternalSyncs", "getSyncCommits"]),
      showDetailView(flight) {
        this[SET_FLIGHT](flight);
        this.fetchFlightStatuses();
      },
    },
    mounted() {
      this.getSyncCommits(this.id);
    },
    watch: {
      id() {
        this.getSyncCommits(this.id);
      }
    }
  }
</script>
<template>
  <div>
    <div class="sync-progress" v-if="syncInProgress">
      <div class="sync-progress__bar">
        <el-progress  :stroke-width="18" :percentage="syncProgressRounded"></el-progress>
      </div>
      <div class="sync-progress__status">
        {{ syncStatus }}
      </div>
    </div>
    <div class="sync-legend">
      <div class="sync-legend__type sync-legend__type_creation">Created ({{createdCommits.length}})</div>
      <div class="sync-legend__type sync-legend__type_update">Updated ({{updatedCommits.length}})</div>
      <div class="sync-legend__type sync-legend__type_deletion">Deactivated ({{deactivated.length}})</div>
    </div>
    <div class="synced-flights synced-flights_created">
      <commit v-for="commit in commits" :commit="commit" :key="commit.id"></commit>
    </div>
  </div>
</template>


<style scoped lang="scss">
  .sync-progress {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    &__bar {
      flex: 0 0 300px;
      margin-right: 20px;
    }
  }
  .sync-legend {
    display: flex;
    margin-bottom: 10px;
    &__type {
      margin-right: 10px;
      background: #fff;
      padding: 0 10px;
      border-radius: 3px;
      border-left: 3px solid;
      &_creation {
        border-left-color: #00B792;

      }
      &_update {
        border-left-color: #d6d614;
      }
      &_deletion {
        border-left-color: #d63747;
      }
    }
  }
  .synced-flights {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;

    &_created {
      flex: 0 0 380px;
      margin-right: 20px;
    }
    &_updated {
      flex: 1 0 760px;

      .synced-flights__cards {
        display: flex;
        flex-flow: row wrap;
        .synced-flight {
          flex: 0 0 300px;
        }
      }
    }
  }
</style>
