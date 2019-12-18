<script>
  import { TableColumn } from 'element-ui';

  import GenericList from '../../../FlightLog/ManifestList/Partials/Generic.vue';
  import createListMixin from '../../../FlightLog/ManifestList/Partials/createListMixin';

  export default {
    mixins: [createListMixin('completedLogs'/*, {recent: true}*/)],

    computed: {
    },

    components: {
      GenericList,
      TableColumn,
    },
  };
</script>

<template>
  <generic-list
    :logs="logList"
    :isLoaded="isLoaded"
    :page="page"
    :count="count"
    :pageSize="pageSize"
    :controlsWidth="140"
    @pageChange="setPage"
    @pageSizeChange="setPageSize"
  >
    <template slot-scope="scope">
      <router-link
        :to="{ name: 'fsdo_manifest', params: { id: scope.row.id } }"
        class="btn btn-info primary btn-sm"
        title="Show log details"
      >
        <i class="fa fa-eye fa-lg"></i>
      </router-link>
      <a
        :href="`/flightlog/pdf-report/${scope.row.id}/`"
        class="btn btn-default btn-sm"
        title="Generate PDF log"
        target="_blank"
      >
        <i class="fa fa-file-pdf-o fa-lg"></i>
      </a>
    </template>
  </generic-list>
</template>
