<script>
  import Collapse from '../../Common/Collapse.vue';
  import WbConfirmModal from '../../WB/LogView/ConfirmModal/View.vue';

  import ManifestConfirmModal from '../Common/ManifestConfirmModal.vue';
  import ManifestDeleteModal from '../Common/ManifestDeleteModal.vue';
  import ManifestsTable from './Manifests/ManifestsTable.vue';
  import ManifestFilters from './Manifests/ManifestFilters.vue';

  import LogsTable from './WbLogs/LogsTable.vue';
  import InOutTime from './ActualDate/Index.vue';
  import { connectMixin } from '../../../sockets';

  export default {
    name: 'DispatchDashboard',

    mixins: [
      connectMixin('wb:list'),
      connectMixin('dispatch:manifests'),
    ],
    components: {
      Collapse,
      LogsTable,
      ManifestsTable,
      ManifestFilters,
      ManifestConfirmModal,
      ManifestDeleteModal,

      WbConfirmModal,
      InOutTime,
    },

    data() {
      return {
        filters: {},
      };
    },
    methods: {
      handleFlightList() {
        this.$router.push({ name: 'dispatch_flight-daily' });
      },
    },
  };
</script>

<template>
  <div class="dispatch-dashboard">
    <manifest-confirm-modal/>
    <manifest-delete-modal/>
    <wb-confirm-modal/>

    <div class="dispatch-dashboard__wb-actual-dates">
      <portal to="header">
        <div class="dispatch-dashboard__header-controls">
          <el-button
            icon="el-icon-date"
            type="primary"
            class="dispatch-dashboard__flight-daily"
            @click.stop="handleFlightList">Flight Daily
          </el-button>
          <portal-target name="flight-list-csv" />
        </div>
      </portal>
      <collapse title="Pending WB Logs">
        <logs-table :status="3" namespace="dispatch/tables/pendingLogs"/>

        <div class="dispatch-dashboard__wb-buttons">
          <router-link class="btn btn-primary btn-outline" :to="{ name: 'wb_list' }">
            <i class="fa fa-balance-scale" />
            Full List of Logs
          </router-link>
        </div>
      </collapse>

      <in-out-time/>
    </div>

    <collapse title="Pending Manifests">
      <manifests-table :status="3"
                       prefix="p"
                       namespace="dispatch/tables/pendingManifests"/>
    </collapse>

    <collapse gutter-color="#ed5767" title="All Manifests">
      <manifest-filters v-model="filters"/>
      <manifests-table prefix="a"
                       :filters="filters"
                       namespace="dispatch/tables/allManifests"
                       show-gutter />
    </collapse>
  </div>
</template>

<style lang="scss">
  @import "../../../../scss/bs-variables";

  .dispatch-dashboard {

    &__wb-actual-dates {
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      > * {
        flex: 0 0 calc(50% - 10px);
        width: calc(50% - 10px);
        @media screen and (max-width: $screen-sm) {
          flex: 1 1 100%;
          width: 100%;
        }
      }
    }

    &__wb-buttons {
      border-top: 1px solid $border-color;
      padding-top: 15px;
      margin-top: 15px;
    }

  }
</style>

