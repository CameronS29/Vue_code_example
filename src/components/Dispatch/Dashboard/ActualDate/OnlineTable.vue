<script>
  import { mapActions } from 'vuex';

  import { tableMixin } from 'Common/SortableTable';
  import { onlineTableApi } from 'api/flight-log/in-out-time';
  import module, { ONLINE_NAMESPACE } from 'store/modules/flightlog/in-out-time';

  import GeneralTable from './Table.vue';


  export default {
    mixins: [tableMixin(ONLINE_NAMESPACE, onlineTableApi, module)],

    components: { GeneralTable },

    data() {
      return { NAMESPACE: ONLINE_NAMESPACE };
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
  <general-table :namespace="NAMESPACE" @approve="handleApprove" />
</template>
