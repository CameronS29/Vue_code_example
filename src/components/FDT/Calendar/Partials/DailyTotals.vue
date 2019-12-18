<script>
  import toDate from 'date-fns/toDate';
  import { DateTime } from 'luxon';
  import { sum, map, filter, round, range, flatten, pick, clamp } from 'lodash';

  import { BlockTypes } from 'store/modules/fdt/consts';
  import OCFMultiPopup from '../../Common/OCFMultiForm.vue';

  export default {
    name: 'DailyTotals',
    components: { OCFMultiPopup },
    props: {
      day: Number,
      date: DateTime,
      blocks: Object,
      ocfEdit: Boolean,
    },

    computed: {
      dailyBlocks() {
        return this.blocks[this.day];
      },

      ocfs() {
        return filter(this.blocks[this.day], block => (block.type === BlockTypes.OCF));
      },

      last1Day() {
        const durations = filter(map(this.dailyBlocks, 'duration'));
        return round(sum(durations), 1);
      },

      last7Days() {
        const weekRange = range(clamp(this.day - 6, 1, 31), clamp(this.day + 1, 31));
        const blocks = flatten(Object.values(pick(this.blocks, weekRange)));
        const distinct = filter(blocks, (block, idx) => block !== blocks[idx - 1]);

        const flown = filter(map(distinct, 'duration'));
        return round(sum(flown), 1);
      },

      lastMonth() {
        const weekRange = range(clamp(this.day - 31, 1, 31), clamp(this.day + 1, 31));
        const blocks = flatten(Object.values(pick(this.blocks, weekRange)));

        const distinct = filter(blocks, (block, idx) => block !== blocks[idx - 1]);
        const flown = filter(map(distinct, 'duration'));
        return round(sum(flown), 1);
      },

      ocf1Day() {
        const ocf = filter(this.dailyBlocks, 'is_ocf');
        const durations = map(ocf, flight => toDate(flight.datetime_off) - toDate(flight.datetime_on));
        return round(sum(durations) / (1000 * 60 * 60), 2);
      },

      ocfNightLanding() {
        const ocf = filter(this.dailyBlocks, 'is_ocf');
        return filter(ocf, 'ocf.night_landed').length;
      },
    },
  };
</script>

<template>
  <div class="fdt-daily-totals">
    <span class="fdt-daily-totals__column">{{ last1Day }}</span>
    <span class="fdt-daily-totals__column">{{ last7Days }}</span>
    <span class="fdt-daily-totals__column">{{ lastMonth }}</span>
    <span class="fdt-daily-totals__column">{{ ocfNightLanding }}</span>
    <span class="fdt-daily-totals__column">
      {{ ocf1Day }}
      <el-popover placement="left" trigger="click" popper-class="fdt-daily-totals__popper" v-if="ocfEdit">
        <el-button class="fdt-daily-totals__ocf-button" slot="reference" icon="el-icon-plus" size="mini" />
        <o-c-f-multi-popup :ocfs="ocfs" :date="date" />
      </el-popover>
    </span>
  </div>
</template>

<style lang="scss">
  @import "../scss/variables";

  .fdt-daily-totals {
    height: $row-size;
    display: table-row;
    position: relative;

    &__column {
      display: table-cell;
      vertical-align: middle;
      text-align: center;
      border-top: $border-base;
    }

    &__popper {
      padding: 0;
    }

    &__ocf-button.el-button {
      padding: 2px;
      margin: 2px;
    }
  }
</style>
