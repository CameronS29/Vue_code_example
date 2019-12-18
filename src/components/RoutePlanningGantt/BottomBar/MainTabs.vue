<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { find } from 'lodash';

  import { UNASSIGNED_TAB, CREW_GANTT_TAB, TAIL_VIEW_TAB } from 'store/modules/routeplanningGantt';
  import Unassigned from './Unassigned.vue';
  import TailDetails from '../TailDetails/Main.vue';
  import PilotTable from '../../Scheduling/Gantt/PilotTable.vue';

  export default {
    created() {
      this.refreshSchedGantt();
    },
    components: {
      Unassigned,
      TailDetails,
      PilotTable,
    },
    computed: {
      ...mapState('routeplanningGantt', [
        'isMainTabsExpanded',
        'filters',
        'activeMainTab',
        'eCheckListMode',
        'ganttTableRange',
      ]),
      ...mapGetters('routeplanningGantt', [
        'grid',
        'totalFlightsCount',
        'unassignedFlightsCount',
        'detailedViewTail',
        'ganttDateRangeISO',
      ]),

      expandBtnClass() {
        return {
          'gantt-main-tabs__expand': true,
          'gantt-main-tabs__expand_expanded': this.isMainTabsExpanded,
        };
      },
    },
    methods: {
      ...mapMutations('routeplanningGantt', [
        'setActiveMainTab',
        'setDetailedViewTail',
        'setFlightAssignment',
        'toggleMainTabs',
      ]),
      ...mapActions('scheduling/gantt', { fetchSchedGantt: 'fetch' }),

      titleClass(tab) {
        return {
          'gantt-main-tabs__title': true,
          'gantt-main-tabs__title_active': this.activeMainTab === tab,
          'gantt-main-tabs__title_disabled': (tab === TAIL_VIEW_TAB) && !this.detailedViewTail,
        };
      },
      changeTab(tab) {
        this.setActiveMainTab(tab);
      },
      refreshSchedGantt() {
        this.fetchSchedGantt({
          dates: this.ganttDateRangeISO,
        });
      },
    },
    data() {
      return {
        UNASSIGNED_TAB,
        CREW_GANTT_TAB,
        TAIL_VIEW_TAB,
      };
    },
    watch: {
      ganttDateRangeISO: 'refreshSchedGantt',
    },
  };
</script>

<template>
  <section class="gantt-main-tabs">
    <header class="gantt-main-tabs__header">
      <div :class="expandBtnClass" @click="toggleMainTabs">
        <i class="fa fa-angle-up" v-if="isMainTabsExpanded" />
        <i class="fa fa-angle-down" v-else />
      </div>
      <div :class="titleClass(UNASSIGNED_TAB)" @click="changeTab(UNASSIGNED_TAB)">
        <i class="fa fa-calendar-times-o" /> Unassigned ({{ unassignedFlightsCount }}/{{ totalFlightsCount }})
      </div>
      <div :class="titleClass(CREW_GANTT_TAB)" @click="changeTab(CREW_GANTT_TAB)">
        <i class="fa fa-user" /> Crew gantt
      </div>
      <div :class="titleClass(TAIL_VIEW_TAB)" @click="changeTab(TAIL_VIEW_TAB)">
        <i class="fa fa-plane" /> Tail detailed
      </div>
    </header>

    <div class="gantt-main-tabs__content" v-if="isMainTabsExpanded">
      <unassigned v-if="activeMainTab === UNASSIGNED_TAB" />
      <tail-details v-if="activeMainTab === TAIL_VIEW_TAB" />
      <pilot-table v-if="activeMainTab === CREW_GANTT_TAB"
                   :date-range="ganttDateRangeISO"
                   :range="ganttTableRange"
                   :is-route-planning-embedded="true" />
    </div>
  </section>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .gantt-main-tabs {
    background: #fff;

    &__header {
      display: flex;
      background: #eaeaeb;
    }

    &__title {
      cursor: pointer;
      padding: 0 5px;
      height: 25px;
      line-height: 25px;
      transition: .2s;

      &_active {
        background: #1ab394;
        color: #fff;
      }

      &_disabled {
        cursor: default;
        opacity: .5;
        pointer-events: none;
      }
    }

    &__expand {
      cursor: pointer;
      width: 20px;
      text-align: center;
      height: 25px;
      line-height: 25px;
      background: darken(#eaeaeb, 10%);
    }

    &__empty {
      opacity: .6;
      padding: 0 7px;
    }
  }
</style>
