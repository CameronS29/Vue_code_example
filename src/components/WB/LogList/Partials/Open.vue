<script>
  import logListMixin from './logListMixin';
  import {
    STATUS_OPEN,
    STATUS_READY_FOR_APPROVAL,
    STATUS_PIC_APPROVAL,
  } from '../../../../store/modules/wb/consts';

  export default {
    mixins: [logListMixin],

    computed: {
      openStates() {
        return [STATUS_READY_FOR_APPROVAL, STATUS_OPEN];
      },
    },

    methods: {
      canDelete(log) {
        return this.isAdmin || log.status < STATUS_PIC_APPROVAL;
      },
    },
  };
</script>

<template>
  <generic-list namespace="wb/tables/openLogs"
                :states="openStates"
                controls-width="100"
                prefix="o">
    <template slot-scope="scope">
      <router-link
        :to="{ name: 'wb_log', params: { id: scope.row.id } }"
        class="btn btn-primary btn-sm"
        title="Show log details"
      >
        <i class="fa fa-pencil-square-o fa-lg" />
      </router-link>

      <a
        v-if="canDelete(scope.row)"
        class="btn btn-danger btn-sm"
        title="Delete log"
        @click="handleDeleteLog(scope.row)"
      >
        <i class="fa fa-trash fa-lg"></i>
      </a>
    </template>
  </generic-list>
</template>
