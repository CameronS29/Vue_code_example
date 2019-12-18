<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { throttle } from 'lodash';

  import GanttTable from 'Common/GanttTable.vue';
  import Flight from '../Flight/BlockView.vue';

  export default {
    async created() {
      await this.fetchUnassigned();
    },
    components: {
      Flight,
      GanttTable,
    },
    computed: {
      ...mapState('app', [
        'windowHeight',
      ]),
      ...mapState('routeplanningGantt', [
        'unassignedSearchFilter',
        'ganttTableRange',
        'flightAssignment',
      ]),
      ...mapGetters('routeplanningGantt', [
        'ganttDateRange',
        'filteredUnassignedPlacementMap',
        'gridStartDate',
        'unassignedFullHeight',
        'fullHeight',
        'dynamicAreasHeight',
      ]),
      searchQuery: {
        get() {
          return this.unassignedSearchFilter;
        },
        set: throttle(function (value) {
          this.setUnassignedSearchFilter(value);
        }, 500, {
          leading: false,
          trailing: true,
        }),
      },
      ganttTableStyle() {
        return {
          height: `${(this.dynamicAreasHeight > this.fullHeight)
            ? this.unassignedFullHeight
            : this.dynamicAreasHeight * this.unassignedFullHeight / this.fullHeight}px`,
        };
      },
      updateTrigger() {
        return !!this.flightAssignment * +new Date;
      },
    },
    methods: {
      ...mapActions('routeplanningGantt', [
        'fetchUnassigned',
        'assignFlight',
      ]),
      ...mapMutations('routeplanningGantt', [
        'setUnassignedSearchFilter',
      ]),
      handleArrowClick(flight) {
        this.assignFlight(flight);
      },
    },
  };
</script>

<template>
  <div class="unassigned-tab">
    <gantt-table
      class="unassigned-tab__gantt-table"
      :style="ganttTableStyle"
      :range="ganttTableRange"
      :date-range="ganttDateRange"
      :default-date="gridStartDate"
      row-class="unassigned-tab__row"
      :scroll-sync="{ id: 'routeplanning', y: false }"
      :update-trigger="updateTrigger"
      hidden-header>
      <template slot="fixed">
        <aside class="unassigned-tab__filter">
          <el-input
            suffix-icon="el-icon-search"
            v-model="searchQuery"
            size="mini" />
          <div class="unassigned-tab__desc">
            filter by flight number, origin or destination
          </div>
        </aside>
      </template>

      <template slot="grid">
        <div :key="index"
             v-for="(level, index) in filteredUnassignedPlacementMap"
             class="unassigned-tab__row">
          <flight :show-plus="!!flightAssignment.aircraft"
                  @plus-click="handleArrowClick"
                  timeline-position :flight="flight" :key="flight.id" v-for="flight in level" />
        </div>
      </template>
    </gantt-table>
  </div>
</template>

<style lang="scss">
  .unassigned-tab {
    display: flex;
    &__gantt-table {
      width: 100%;
    }
    &__filter {
      width: 215px;
      padding: 5px 10px 10px;
    }
    &__desc {
      margin-top: 5px;
      white-space: normal;
      color: #b1b1b1;
      font-size: 11px;
    }
    &__row {
      height: 20px;
      position: relative;
    }
  }
</style>
