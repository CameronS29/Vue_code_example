<script>
  import { mapState, mapMutations } from 'vuex';
  import * as consts from 'store/modules/scheduling/consts';
  import { DateTime } from 'luxon';

  export default {
    props: {
      date: {
        type: DateTime,
        required: true,
      },
    },

    computed: {
      ...mapState('scheduling/calendar/sort', ['daySort']),

      arrow() {
        if (this.daySort === parseInt(this.date.day)) return '↑';
        if (this.daySort === -parseInt(this.date.day)) return '↓';

        return '';
      },

      sortOptions() {
        return { 'Assigned first': this.date.day, 'Unassigned first': -this.date.day };
      },

      sortValue() {
        return Math.abs(this.daySort) === parseInt(this.date.day)
          ? this.daySort
          : null;
      },
    },

    methods: {
      ...mapMutations('scheduling/calendar/sort', [consts.CHANGE_DAY_SORT]),

      handleDaySortChange(value) {
        this[consts.CHANGE_DAY_SORT](value);
      },
    },
  };
</script>

<template>
  <el-popover
    placement="top"
    trigger="hover">
    <div slot="reference">
      <span class="pilot-grid__week-day-label">{{ date.toFormat('ccc') }}</span>
      {{ date.day }}
      <span class="arrow">{{ arrow }}</span>
    </div>
    <div class="pilot-grid__day-sort-popover">
      Sort:
      <el-select
        :value="sortValue"
        clearable
        size="mini"
        @input="handleDaySortChange"
        placeholder="None">
        <el-option
          v-for="(sort, key) in sortOptions"
          :key="sort"
          :label="key"
          :value="sort" />
      </el-select>
    </div>
  </el-popover>
</template>

<style lang="scss">
  .pilot-grid {
    &__week-day-label{
      position: absolute;
      left: 0;
      top: 3px;
      line-height: 8px;
      font-size: 8px;
      width: 100%;
      opacity: .5;
      font-weight: normal;
    }
    &__day-sort-popover {
      .el-select {
        margin-left: 5px;
      }
    }
  }
</style>
