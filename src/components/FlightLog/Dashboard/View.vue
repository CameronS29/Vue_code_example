<script>
  import { mapGetters } from 'vuex';
  import { checkFlag } from 'utils/permissions/waffle';

  import ViewPortal from 'Common/ViewPortal.vue';
  import Collapse from 'Common/Collapse.vue';

  import ManifestConfirmModal from '../../Dispatch/Common/ManifestConfirmModal.vue';
  import ManifestDeleteModal from '../../Dispatch/Common/ManifestDeleteModal.vue';
  import ManifestsTable from '../../Dispatch/Dashboard/Manifests/ManifestsTable.vue';
  import ManifestFilters from '../../Dispatch/Dashboard/Manifests/ManifestFilters.vue';
  import CompletedFilters from './Filters/CompletedFilters.vue';
  import CreateManifestForm from './CreateManifestForm.vue';

  export default {
    name: 'DispatchDashboard',

    components: {
      Collapse,
      ViewPortal,
      ManifestsTable,
      ManifestFilters,
      CompletedFilters,
      ManifestConfirmModal,
      ManifestDeleteModal,
      CreateManifestForm,
    },

    computed: {
      ...mapGetters('user', ['user', 'flags']),

      showFDTButton() {
        return checkFlag(this.flags.show_fd, this.user);
      },

      showScheduleButton() {
        return checkFlag(this.flags.show_scheduler, this.user);
      },
    },

    data() {
      return {
        filters: {},
        completedFilters: {},
        pendingStatues: [1, 2],
        completeStatues: [3, 4, 5],
      };
    },
  };
</script>

<template>
  <div>
    <view-portal to="header" min-width="900px">
      <div>
        <router-link class="el-button el-button--primary"
                     v-if="showFDTButton"
                     :to="{ name: 'fdt_calendar', pilotId: user.pilot}">
          My Flight and Duty
        </router-link>
        <router-link class="el-button el-button--primary"
                     v-if="showScheduleButton"
                     :to="{ name: 'pilot_sched'}">
          My Schedule
        </router-link>
      </div>
    </view-portal>
    <manifest-confirm-modal />
    <manifest-delete-modal />
    <create-manifest-form />

    <collapse title="Pending Manifests">
      <manifests-table :status="pendingStatues" prefix="p"
        :searchable="false"
        namespace="dispatch/tables/pendingManifests" />
    </collapse>
    <collapse gutter-color="#f8ac59" title="Last Completed Manifests">
      <completed-filters v-model="completedFilters"/>
      <manifests-table :status="pendingStatues" prefix="c"
        :filters="completedFilters" :showHobbs="true" :searchable="false"
        namespace="pilotManifest/tables/completedManifests"/>
    </collapse>

    <collapse gutter-color="#ed5767" title="All Completed Manifests">
      <manifest-filters v-model="filters" :hideStatus="true" />
      <manifests-table prefix="a" :filters="filters" :status="completeStatues"
        searchable="search"
        :showHobbs="true" namespace="dispatch/tables/allManifests" show-gutter/>
    </collapse>
  </div>
</template>

<style lang="scss">
  @import "../../../../scss/bs-variables";

  .dispatch-dashboard {

    &__wb-buttons {
      border-top: 1px solid $border-color;
      padding-top: 15px;
      margin-top: 15px;
    }
  }
</style>

