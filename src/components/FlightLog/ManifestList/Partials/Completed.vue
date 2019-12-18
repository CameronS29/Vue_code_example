<script>
  import { mapGetters } from 'vuex';
  import { TableColumn } from 'element-ui';

  import GenericList from './Generic.vue';
  import createListMixin from './createListMixin';

  export default {
    mixins: [createListMixin('completedLogs')],

    computed: {
      ...mapGetters('user', [
        'isAdmin',
      ])
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
        :to="{ name: 'wb_log', params: { id: scope.row.id } }"
        class="btn btn-info primary btn-sm"
        title="Show log details"
      >
        <i class="fa fa-eye fa-lg"></i>
      </router-link>

      <a
        :href="`/flightlog/pdf-report/183/${scope.row.id}`"
        class="btn btn-default btn-sm"
        title="Generate PDF log"
        target="_blank"
      >
        <i class="fa fa-file-pdf-o fa-lg"></i>
      </a>

      <a
        v-if="isAdmin"
        class="btn btn-danger btn-sm"
        title="Delete log"
        @click="setDelete(scope.row)"
      >
        <i class="fa fa-trash fa-lg"></i>
      </a>
    </template>
  </generic-list>
</template>
