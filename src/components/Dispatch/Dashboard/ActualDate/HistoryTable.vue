<script>
  import { mapActions } from 'vuex';

  import { tableMixin } from 'Common/SortableTable';
  import { historyTableApi } from 'api/flight-log/in-out-time';
  import module, { HISTORY_NAMESPACE } from 'store/modules/flightlog/in-out-time';

  import GeneralTable from './Table.vue';

  export default {
    mixins: [tableMixin(HISTORY_NAMESPACE, historyTableApi, module)],

    components: { GeneralTable },

    data() {
      return { NAMESPACE: HISTORY_NAMESPACE };
    },

    methods: {
      ...mapActions('flightlog/in-out-time', ['approve']),

      async handleApprove(record) {
        await this.approve(record.id);
      },
    },
  };
</script>

<template>
  <general-table :namespace="NAMESPACE" history @approve="handleApprove" />
</template>
