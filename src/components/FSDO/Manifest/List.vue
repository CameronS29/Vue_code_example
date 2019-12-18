<script>
  import Collapse from 'Common/Collapse.vue';
  import SearchInput from 'Common/SearchInput.vue';
  import { queryParam } from '../../../utils/routers';
  import RecentCompletedLogs from './Partials/RecentCompleted.vue';

  export default {
    data() {
      return {
        SearchInput,
      };
    },

    computed: {
      searchQuery: queryParam({ param: 'search' }),
    },

    components: {
      Collapse,
      RecentCompletedLogs,
    },
  };
</script>

<template>
  <collapse title="Recent Completed Flight Logs" gutter-color="#ED5565">
    <recent-completed-logs />
  </collapse>
</template>

