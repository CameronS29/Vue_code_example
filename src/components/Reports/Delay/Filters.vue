<script>
  import { DateTime } from 'luxon';
  import { mapState, mapGetters, mapMutations } from 'vuex';
  import { queryParam } from 'utils/routers';
  import { toWeekDateRange } from 'utils/date';

  import ViewPortal from 'Common/ViewPortal.vue';
  import FormattedWeekPicker from 'Common/FormattedWeekPicker.vue';
  import TableFilters from './DelayTable/Filters.vue';
  import ErrorBadge from './DelayGantt/ErrorBadge.vue';
  import { timeZones } from '../utils';

  export default {
    name: 'Filters',

    components: {
      FormattedWeekPicker,
      ViewPortal,
      TableFilters,
      ErrorBadge,
    },

    computed: {
      ...mapState('reports/delay-gantt', ['weekDateRange', 'range', 'zone']),
      ...mapGetters('reports/delay-gantt', ['weekEndDate']),

      timeZones() { return timeZones; },
      groupBy: queryParam({ param: 'groupby', defaultValue: 'station' }),
      type: queryParam({ param: 'type', defaultValue: 'gantt' }),
    },

    methods: {
      ...mapMutations('reports/delay-gantt', [
        'setWeekDateRange',
        'setRange',
        'setZone',
      ]),

      handleWeekChange(value) {
        this.setWeekDateRange(toWeekDateRange(DateTime.fromJSDate(value)));
      },
      handleGroupChange(group) {
        this.groupBy = group;
      },
      handleTypeChange(type) {
        this.type = type;
      },
    },
  };
</script>

<template>
  <view-portal min-width="1400px" to="header">
    <div class="delay-filters">
      <div class="delay-filters__gantt" v-if="type === 'gantt'">
        <el-select style="width: 80px; margin-right: 15px;" :value="zone" @change="setZone">
          <el-option v-for="tz in timeZones"
                     :key="tz.name"
                     :label="tz.name"
                     :value="tz.offset">
            {{ tz.name }}
          </el-option>
        </el-select>

        <div class="delay-filters__types">
          <error-badge type="maintenance" title="maintenance" />
          <error-badge type="late-passenger" title="late passenger" />
          <error-badge type="late-aircraft" title="late aircraft" />
        </div>
        <div class="delay-filters__types">
          <error-badge type="weather" title="weather" />
          <error-badge type="crew" title="crew" />
          <error-badge type="fuel" title="fuel" />
        </div>
        <div class="delay-filters__types">
          <error-badge type="atc" title="ATC" />
          <error-badge type="other" title="other" />
        </div>

        <div class="delay-filters__types">
          <div class="delay-filters__type">
            <div class="delay-filters__type-badge delay-filters__type-badge_actual" />
            actual
          </div>
          <div class="delay-filters__type">
            <div class="delay-filters__type-badge delay-filters__type-badge_scheduled" />
            scheduled
          </div>
        </div>

        <div class="delay-filters__range">
          <div class="delay-filters__range-labels">
            <span class="delay-filters__range-label">3 hours</span>
            <span class="delay-filters__range-label">day</span>
          </div>
          <el-slider
            :value="range"
            @input="setRange"
            :step="0.08"
            :min="0.125"
            :show-tooltip="false"
            :max="1"
          />
        </div>

        <formatted-week-picker :value="weekEndDate.toJSDate()" @input="handleWeekChange" />
      </div>
      <table-filters v-else-if="type === 'table'" />

      <el-button-group class="delay-filters__button-group">
        <el-button
          type="primary"
          size="small"
          :disabled="type === 'gantt'"
          @click="handleTypeChange('gantt')"
        >Gantt</el-button>

        <el-button
          type="primary"
          size="small"
          :disabled="type === 'table'"
          @click="handleTypeChange('table')"
        >Table</el-button>
      </el-button-group>

      <el-button-group class="delay-filters__button-group">
        <el-button
          type="primary"
          size="small"
          :disabled="groupBy === 'station'"
          @click="handleGroupChange('station')"
        >Station</el-button>

        <el-button
          type="primary"
          size="small"
          :disabled="groupBy === 'tail'"
          @click="handleGroupChange('tail')"
        >Tail</el-button>
      </el-button-group>
    </div>
  </view-portal>
</template>

<style lang="scss">
  @import "colors";

  .delay-filters {
    display: flex;
    align-items: center;

    &__gantt {
      display: flex;
    }

    &__range {
      width: 130px;
      margin-left: 15px;
      &-labels {
        color: #8B8E8F;
        font-size: 13px;
        display: flex;
        justify-content: space-between;
      }
      &-label {
        &:nth-child(1) {
          flex: 1 1 50px;
        }
        &:nth-child(2) {
          flex: 0 0 auto;
        }
      }
      .el-slider__runway {
        margin: 10px 0;
      }
    }

    &__type {
      display: flex;
      align-items: center;
    }

    &__type-badge {
      height: 15px;
      width: 15px;
      margin-right: 5px;
      border: 1px solid $--border-color-base;

      &_actual { background: $actual-background; }
      &_scheduled { background: $scheduled-background; }
    }

    &__button-group {
      margin-left: 10px;
    }
  }
</style>
