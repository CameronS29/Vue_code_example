<script>
  import { mapState, mapGetters, mapMutations } from 'vuex';
  import { DateTime } from 'luxon';
  import { sortedIndex, sortedLastIndex, min, max, filter } from 'lodash';

  import { isSameDate } from 'utils/date';
  import ShiftLine from './ShiftLine.vue';
  import BlockLine from './BlockLine.vue';
  import { ACTIVE_BLOCK, ACTIVE_SHIFT } from '../../../../store/modules/fdt/legality';

  const getOnTs = unit => DateTime.fromISO(unit.datetime_on).valueOf();
  const getOffTs = unit => DateTime.fromISO(unit.datetime_off).valueOf();

  export default {
    name: 'DaySection',

    props: {
      shifts: { type: Array, required: false },
      blocks: { type: Array, required: false },
      day: { type: DateTime, required: false },
    },

    components: {
      ShiftLine,
      BlockLine,
    },

    computed: {
      ...mapState('fdt/legality', [
        'hoverBlockTime',
        'activeBlockTime',
        'hoverShift',
        'activeShift',
      ]),
      ...mapGetters('fdt/calendar', ['tz']),

      onBlockTs() {
        return this.blocks.map(getOnTs);
      },

      offBlockTs() {
        return this.blocks.map(getOffTs);
      },

      onShiftTs() {
        return this.shifts.map(getOnTs);
      },

      offShiftTs() {
        return this.shifts.map(getOffTs);
      },

      currentTime() {
        return DateTime.local().setZone(this.tz);
      },

      isToday() {
        return isSameDate(this.day, this.currentTime);
      },

      classes() {
        return {
          calendar__row: true,
          calendar__row_weekend: [6, 7].indexOf(this.day.weekday) !== -1,
        };
      },

      currentTimeStyle() {
        const diff = this.currentTime.diff(this.currentTime.startOf('day'), 'days').days;

        return {
          left: `${diff * 100}%`,
        };
      },
    },

    methods: {
      ...mapMutations('fdt/legality', [ACTIVE_BLOCK, ACTIVE_SHIFT]),

      handleShiftSelect({ id }) {
        this[ACTIVE_BLOCK](null);
        this[ACTIVE_SHIFT](id);
      },

      handleBlockSelect({ id }) {
        this[ACTIVE_SHIFT](null);
        this[ACTIVE_BLOCK](id);
      },

      hasOverlappedTime(unit) {
        const onTs = DateTime.fromISO(unit.datetime_on);
        const offTs = DateTime.fromISO(unit.datetime_off);

        const leftBlockIdx = sortedIndex(this.offBlockTs, onTs.valueOf());
        const leftShiftIdx = sortedIndex(this.offShiftTs, onTs.valueOf());

        const rightBlockIdx = sortedLastIndex(this.onBlockTs, offTs.valueOf());
        const rightShiftIdx = sortedLastIndex(this.onShiftTs, offTs.valueOf());

        const maxLeftTs = max(filter([
          this.offBlockTs[leftBlockIdx - 1],
          this.offShiftTs[leftShiftIdx - 1],
        ]));

        const minRightTs = min(filter([
          this.onBlockTs[rightBlockIdx],
          this.onShiftTs[rightShiftIdx],
        ]));

        return {
          left: maxLeftTs && onTs.diff(DateTime.fromMillis(maxLeftTs)).as('hours') < 2,
          right: minRightTs && DateTime.fromMillis(minRightTs).diff(offTs).as('hours') < 2,
        };
      },
    },
  };
</script>

<template>
  <div :class="classes">
    <div v-if="isToday" :style="currentTimeStyle" class="calendar__row-current-vertical" />

    <shift-line
      v-for="shift in shifts"
      :block="shift"
      :key="shift.id"
      :day="day"
      :hovered="hoverShift === shift.id"
      :active="activeShift === shift.id"
      :overlaps="hasOverlappedTime(shift)"
      @click="handleShiftSelect(shift)"
    />

    <block-line
      v-for="block in blocks"
      :block="block"
      :key="block.id"
      :day="day"
      :active="activeBlockTime === block.id"
      :overlaps="block.is_ocf ? hasOverlappedTime(block) : undefined"
      @click="handleBlockSelect(block)"
    />
  </div>
</template>
