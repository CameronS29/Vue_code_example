<script>
  import { property } from 'lodash';
  import SortableTable, { tableMixin } from 'Common/SortableTable';
  import tableApi from 'api/factory/table';

  export default {
    name: 'RecordsTable',
    mixins: [tableMixin(property('namespace'), tableApi('/tracking/list/'))],

    props: {
      namespace: {
        type: String,
        required: true,
      },

      prefix: {
        type: String,
        default: '',
      },

      filters: Object,
    },

    components: { SortableTable },
  };
</script>

<template>
  <sortable-table :namespace="namespace"
                  :query-prefix="prefix"
                  :filters="filters">
    <slot />
  </sortable-table>
</template>
