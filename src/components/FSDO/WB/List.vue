<script>
  import { mapActions } from 'vuex';
  import Collapse from 'Common/Collapse.vue';
  import RecentCompletedLogs from './Partials/RecentCompleted.vue';

  export default {
    components: {
      Collapse,
      RecentCompletedLogs,
    },

    created() {
      this.getAllOptions();
    },

    methods: mapActions('wb', ['getAllOptions']),
  };
</script>

<template>
  <div>
    <collapse title="Recent Completed WB Logs" gutter-color="#ED5565">
      <recent-completed-logs />
    </collapse>
  </div>
</template>
