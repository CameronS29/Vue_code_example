<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { DateTime } from 'luxon';
  import { debounce } from 'lodash';

  import { CHANGE_DATE } from 'store/modules/scheduling/consts';
  import Filters from '../Common/Filters.vue';
  import PilotTable from './PilotTable.vue';
  import FlightDetails from '../../Flight/Status/FlightDetails.vue';

  export default {
    async created() {
      this[CHANGE_DATE](DateTime.fromObject({
        year: parseInt(this.$route.params.year),
        month: parseInt(this.$route.params.month),
      })
        .toJSDate());

      this.fetchRevisions();
    },
    components: {
      Filters,
      PilotTable,
      FlightDetails,
    },
    computed: {
      ...mapState('scheduling/calendar', ['year', 'month']),
      ...mapState('scheduling/calendar/filters', ['actual']),
      ...mapGetters('scheduling/calendar/filters', ['apiFormat']),
      ...mapGetters('scheduling/revisions', ['activeRevision']),
      ...mapGetters('scheduling/calendar', ['UTCDate']),
      ...mapState('scheduling/gantt', ['range']),

      ganttTableDateRange() {
        return [
          this.UTCDate.startOf('month')
            .toISO(),
          this.UTCDate.endOf('month')
            .minus({ seconds: 1 })
            .toISO(),
        ];
      },
    },
    methods: {
      ...mapMutations('scheduling/calendar', [CHANGE_DATE]),
      ...mapActions('scheduling/revisions', ['getRevisions']),
      ...mapActions('scheduling/gantt', ['fetch']),

      fetchRevisions: debounce(async function () {
        const { year, month } = this;
        await this.getRevisions({
          year,
          month
        });
      }, 300),

      fetchBasedOnRevision() {
        const { month, year } = this.activeRevision;
        const date = DateTime.fromObject({ month, year }).setZone('utc', { keepCalendarTime: true });

        this.fetch({
          dates: [date.toISO(), date.endOf('month').toISO()],
          filters: this.apiFormat,
        });
      },
    },
    watch: {
      year: 'fetchRevisions',
      month: 'fetchRevisions',
      activeRevision: 'fetchBasedOnRevision',
      actual: 'fetchBasedOnRevision',
      $route(to, from) {
        if (to.params.year !== from.params.year || to.params.month !== from.params.month) {
          this[CHANGE_DATE](DateTime.fromObject(to.params)
            .toJSDate());
        }
      },
    },
  };
</script>

<template>
  <main class="sched-gantt">
    <filters
      @submit="fetchBasedOnRevision"
      :show-range-picker="true"
      :show-revision-switcher="false"
      :show-actual-switcher="false"
    />

    <pilot-table :date-range="ganttTableDateRange" :range="range" />
    <flight-details />
  </main>
</template>

<style lang="scss">

</style>
