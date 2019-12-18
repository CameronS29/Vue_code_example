<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { DateTime } from 'luxon';
  import { debounce, isEmpty } from 'lodash';

  import {
    CHANGE_DATE,
    SET_ACTIVE_REVISION,
    SET_PILOT_VIEW,
    SET_PILOT_GRID,
    CHANGE_BASE_AIRPORTS,
  } from 'store/modules/scheduling/consts';
  import PilotList from './PilotList/List.vue';
  import Payroll from './Payroll/Table.vue';
  import PairBindingModal from './PairBindingModal/View.vue';
  import AssignedFlightList from './AssignedFlightList.vue';
  import FDTCalendar from './FDTCalendar.vue';
  import ManifestView from './ManifestView.vue';

  import Filters from '../Common/Filters.vue';

  export default {
    created() {
      this[CHANGE_DATE](DateTime.fromObject({
        year: parseInt(this.$route.params.year),
        month: parseInt(this.$route.params.month),
      }).toJSDate());

      this.fetchRevisions();
      this.getAllAvailableAirports();

      if (this.$route.meta.isPilotView) {
        this[SET_PILOT_VIEW](true);
        this.presetPilotFilters();
      } else {
        this[SET_PILOT_VIEW](false);
      }
    },

    components: {
      Filters,
      PilotList,
      PairBindingModal,
      AssignedFlightList,
      FDTCalendar,
      ManifestView,
      Payroll,
    },

    computed: {
      ...mapState('scheduling/calendar', ['year', 'month', 'showAssignedFlightsDate',
        'showFDTCalendarPilot', 'showManifestId', 'isInPayrollMode']),
      ...mapState('scheduling/calendar/filters', ['actual']),
      ...mapState('scheduling/revisions', ['newlyCreatedFirstDraft', 'lastPublished']),
      ...mapGetters('scheduling/calendar', ['monthString']),
      ...mapGetters('scheduling/revisions', ['hasRevisions', 'activeRevision']),
      ...mapGetters('user', ['user']),

      showCalendar() {
        return (this.hasRevisions && !this.isInPayrollMode) || this.$route.meta.isPilotView;
      },

      showPayroll() {
        return this.hasRevisions && !this.$route.meta.isPilotView && this.isInPayrollMode;
      },
    },

    methods: {
      ...mapActions('airports', ['getAllAvailableAirports']),
      ...mapActions('scheduling/revisions', ['getRevisions']),
      ...mapActions('scheduling/calendar/pilotGrid', ['fetch', 'fetchPayroll']),
      ...mapMutations('scheduling/calendar/pilotGrid', [SET_PILOT_GRID]),
      ...mapActions('scheduling/assignedFlights', ['getAssignedFlightStatus']),
      ...mapMutations('scheduling/calendar', [CHANGE_DATE, SET_PILOT_VIEW]),
      ...mapMutations('scheduling/revisions', [SET_ACTIVE_REVISION]),
      ...mapMutations('scheduling/calendar/filters', [CHANGE_BASE_AIRPORTS]),

      presetPilotFilters() {
        this[CHANGE_BASE_AIRPORTS]([this.user.base]);
      },

      fetchRevisions: debounce(async function () {
        const { year, month } = this;
        try {
          await this.getRevisions({ year, month });
        } finally {
          if (!this.lastPublished) {
            this[SET_PILOT_GRID]([]);
          }
        }
      }, 300),

      fetchRevisionBased(revision) {
        if (revision && !isEmpty(revision)) {
          return Promise.all([
            this.fetch(),
            this.getAssignedFlightStatus(),
          ]);
        }
        return Promise.resolve();
      },

      handleFiltersSubmit() {
        if (this.isInPayrollMode) {
          this.fetchPayroll();
        } else {
          this.fetch();
        }
      },
    },

    watch: {
      year: 'fetchRevisions',
      month: 'fetchRevisions',
      activeRevision: 'fetchRevisionBased',
      actual: 'getAssignedFlightStatus',
      newlyCreatedFirstDraft() {
        this.$message({
          message: 'The last Draft successfully removed and New one created instead',
          type: 'success',
          duration: 5e3,
        });
      },
      isInPayrollMode(enabled) {
        if (enabled) {
          this.fetchPayroll();
        } else {
          this.fetch();
        }
      },
      $route(to, from) {
        if (to.params.year !== from.params.year || to.params.month !== from.params.month) {
          const { year, month } = to.params;
          this[CHANGE_DATE](DateTime.fromObject({
            year: parseInt(year),
            month: parseInt(month),
          }).toJSDate());
        }
      },
    },
  };
</script>

<template>
  <main class="scheduling-page">
    <div class="interactive-table">
      <filters @submit="handleFiltersSubmit" @actual-changed="handleFiltersSubmit" />

      <pilot-list v-if="showCalendar" />
      <payroll v-if="showPayroll" />
    </div>

    <pair-binding-modal />
    <assigned-flight-list />
    <FDTCalendar />
    <manifest-view />
  </main>
</template>

<style lang="scss" scoped>
  @import '../../../../scss/bs-variables';

  .scheduling-page {
    margin-bottom: 15px;
    display: flex;
    .fdt-calendar-wrapper {
      flex: 1 1 100%;
    }
    .interactive-table {
      flex: 1 1;
      flex-flow: row wrap;
      max-width: 100%;
      .filters {
        @media screen and (max-width: $screen-md-max) {
          flex-flow: row wrap;
        }
      }
      .pilot-grid {
        flex: 1 1 100%;
      }
      .alert {
        border: 1px solid;
      }
    }
  }
</style>
