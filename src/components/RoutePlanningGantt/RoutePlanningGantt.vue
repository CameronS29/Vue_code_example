<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import ViewPortal from 'Common/ViewPortal.vue';

  import Grid from './Grid/Grid.vue';
  import Filters from './Filters.vue';
  import SelectionControls from './SelectionControls.vue';
  import MainTabs from './BottomBar/MainTabs.vue';
  import AircraftTabs from './BottomBar/AircraftTabs.vue';
  import Sidebar from './Sidebar/Sidebar.vue';
  import FlightDetails from '../Flight/Status/FlightDetails.vue';
  import TailDetails from './TailDetails/Main.vue';
  import BatchRemoveModal from './BatchRemoveModal.vue';
  import { connectMixin } from '../../sockets';

  export default {
    mixins: [
      connectMixin('rp:assigned'),
      connectMixin('flightlog:aircraft'),
    ],

    components: {
      ViewPortal,

      Grid,
      Filters,
      SelectionControls,
      MainTabs,
      AircraftTabs,
      Sidebar,
      FlightDetails,
      TailDetails,
      BatchRemoveModal,
    },

    computed: {
      ...mapState('routeplanningGantt', ['isInSelectionMode']),
      selectionMode() {
        return this.isInSelectionMode;
      },
    },

    methods: {
      goToNow() {
        this.$refs.grid.scrollToNow();
      },
    },
  };
</script>

<template>
  <main class="aircraft-gantt">
    <view-portal min-width="1000px" to="header">
      <selection-controls v-if="selectionMode" />
      <filters v-else @go-to-now-click="goToNow" />
    </view-portal>

    <div class="aircraft-gantt__main-area">
      <grid ref="grid" />

      <main-tabs />
      <aircraft-tabs />
    </div>

    <sidebar class="aircraft-gantt__sidebar" />

    <flight-details :z-index="9000" />
    <batch-remove-modal />
  </main>
</template>

<style lang="scss">
  .aircraft-gantt {
    display: flex;
    position: relative;
    height: calc(100vh - 70px);

    &__main-area {
      flex: 1 1;
      display: flex;
      flex-flow: column;
      overflow: hidden;
    }
    &__sidebar {
      flex: 0 0 450px;
    }
  }
</style>
