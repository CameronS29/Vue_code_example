<script>
  import logListMixin from './logListMixin';
  import {
    STATUS_PIC_APPROVAL,
    STATUS_DISPATCH_APPROVAL,
  } from '../../../../store/modules/wb/consts';

  export default {
    mixins: [logListMixin],

    computed: {
      pinnedStatuses() {
        return [STATUS_PIC_APPROVAL, STATUS_DISPATCH_APPROVAL];
      },
    },
  };
</script>

<template>
  <generic-list namespace="wb/tables/completedLogs"
                :states="pinnedStatuses"
                controls-width="140"
                prefix="c">
    <template slot-scope="scope">
      <router-link
        :to="{ name: 'wb_log', params: { id: scope.row.id } }"
        class="btn btn-info primary btn-sm"
        title="Show log details"
      >
        <i class="fa fa-eye fa-lg" />
      </router-link>

      <a :href="`/wb/pdf/${scope.row.id}`"
         class="btn btn-default btn-sm"
         title="Generate PDF log"
         target="_blank">
        <i class="fa fa-file-pdf-o fa-lg" />
      </a>

      <a v-if="isAdmin"
         class="btn btn-danger btn-sm"
         title="Delete log"
         @click="handleDeleteLog(scope.row)">
        <i class="fa fa-trash fa-lg" />
      </a>
    </template>
  </generic-list>
</template>
