<script>
  import { queryGetter } from 'utils/routers';

  import Filters from './Filters.vue';
  import ReportTable from './DelayTable/View.vue';
  import GanttChart from './DelayGantt/View.vue';

  export default {
    name: 'Dashboard',

    components: {
      Filters,
      GanttChart,
      ReportTable,
    },

    computed: {
      type: queryGetter('type', 'gantt'),
      reportComponent() {
        return {
          gantt: 'GanttChart',
          table: 'ReportTable',
        }[this.type];
      },
    },
  };
</script>

<template>
  <main class="delay-report">
    <filters/>
    <component :is="reportComponent"/>
  </main>
</template>
