<script>
  import { mapActions, mapGetters } from 'vuex';
  import Collapse from 'Common/Collapse.vue';
  import ViewPortal from 'Common/ViewPortal.vue';
  import SecurityTable from './Partials/Table.vue';
  import FilterView from './Partials/Filter.vue';
  import DeleteModal from './Partials/DeleteModal.vue';

  export default {
    components: {
      Collapse,
      SecurityTable,
      FilterView,
      ViewPortal,
      DeleteModal,
    },
    computed: {
      ...mapGetters('security', [
        'reasons'
      ]),
    },
     methods: {
      ...mapActions('security', [
        'getSecurityOptions',
      ])
    },
    created() {
      if (this.reasons.length == 0) {
        this.getSecurityOptions();
      }
    },
    data() {
      return {
        filters: {},
      };
    },
  };
</script>

<template>
  <div>
    <delete-modal />
    <view-portal to="header">
      <router-link
        class="btn btn-primary" title="New security search"
        style="margin-right: auto;"
        :to="{ name: 'security_form'}">
        <i class="el-icon-plus"></i> Security Search
      </router-link>
    </view-portal>
    <collapse title="Filter">
      <filter-view v-model="filters" />
    </collapse>
    <collapse title="Security Search History">
      <security-table :filters="filters" />
    </collapse>
  </div>
</template>
