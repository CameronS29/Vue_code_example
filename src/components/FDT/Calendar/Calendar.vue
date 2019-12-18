<script>
  import { DateTime } from 'luxon';
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import { ACTIVE_BLOCK, ACTIVE_SHIFT } from 'store/modules/fdt/legality';
  import BottomPopper from 'Common/BottomPopper.vue';

  import DaySection from './Partials/DaySection.vue';
  import DailyTotals from './Partials/DailyTotals.vue';

  import BlockTimeInfo from './DetailViews/BlockTimeInfo/View.vue';
  import ShiftInfo from './DetailViews/ShiftInfo/View.vue';

  export default {
    props: {
      pilotId: { type: Number, required: false },
      month: { type: Number, required: false },
      year: { type: Number, required: false },
      ocfEdit: { type: Boolean, default: false },
    },

    components: {
      BottomPopper,
      DailyTotals,
      DaySection,
      BlockTimeInfo,
      ShiftInfo,
    },

    computed: {
      ...mapGetters('flightlog/log', ['log']),
      ...mapGetters('fdt/calendar', ['isLoading', 'date', 'tz']),
      ...mapGetters('fdt/legality', [
        'dailyBlocks',
        'activeBlockTime',
        'dailyShifts',
        'activeShift',
      ]),

      pickedType() {
        if (this.activeBlockTime) {
          return 'BlockTimeInfo';
        }
        if (this.activeShift) {
          return 'ShiftInfo';
        }
        return null;
      },

      pickedValue() {
        return {
          BlockTimeInfo: { block: this.activeBlockTime },
          ShiftInfo: this.activeShift,
        }[this.pickedType];
      },

      daysInMonth() {
        const { year, month } = this;
        return DateTime.fromObject({ year, month }).daysInMonth;
      },
    },

    methods: {
      ...mapActions('flightlog/log', ['getFlightLog', 'clearFlightLog']),
      ...mapMutations('fdt/legality', [ACTIVE_BLOCK, ACTIVE_SHIFT]),

      getDay(day) {
        return DateTime.fromObject({
          year: this.year,
          month: this.month,
          day,
          zone: this.tz,
        });
      },

      getWeekDay(day) {
        return this.date.set({ day }).weekdayShort;
      },

      closeDetailView() {
        this[ACTIVE_BLOCK](null);
        this[ACTIVE_SHIFT](null);
      },
    },

    watch: {
      pickedValue({ block } = {}) {
        if (block !== undefined && block.flightlog !== undefined) {
          this.getFlightLog(block.flightlog.id);
        } else {
          this.clearFlightLog();
        }
      },
    },
  };
</script>

<style src="./scss/calendar.scss" lang="scss"></style>

<template>
  <main class="calendar__wrapper" v-loading="isLoading">
    <div class="calendar">
      <div class="calendar__timeline">
        <div class="calendar__hour" :class="{calendar__hour_delimiter: ((hour - 1) % 6 === 0)}" v-for="hour in 24">
          <span v-if="hour-1 < 10">0</span>{{ hour - 1 }}
        </div>
      </div>
      <div class="calendar__cols">
        <div class="calendar__col" v-for="_ in 24" />
      </div>
      <div class="calendar__body">
        <div class="calendar__day-panel">
          <div class="calendar__day" v-for="day in daysInMonth">
            <div class="calendar__weekday">{{ getWeekDay(day) }}</div>
            {{ day }}
          </div>
        </div>

        <div class="calendar__rows">
          <day-section
            v-for="day in daysInMonth"
            :shifts="dailyShifts[day]"
            :blocks="dailyBlocks[day]"
            :key="day"
            :day="getDay(day)"
          />
        </div>

        <bottom-popper :show="pickedType !== null"
                       :title="pickedType === 'BlockTimeInfo' ? 'Block Time Info' : 'Shift Info'"
                       :max-height="pickedType === 'BlockTimeInfo' ? '350px' : '200px'"
                       header-height="50px"
                       @close="closeDetailView">
          <component
            v-if="pickedType !== null"
            v-bind="pickedValue"
            :log="log"
            :is="pickedType"
            :pilot="pilotId"
          />
        </bottom-popper>
      </div>
    </div>

    <div class="calendar__daily-totals">
      <div class="calendar__daily-totals-title">
        <span class="calendar__total-column">1D</span>
        <span class="calendar__total-column">7D</span>
        <span class="calendar__total-column">1M</span>
        <span class="calendar__total-column">OCFNL</span>
        <span class="calendar__total-column">OCF</span>
      </div>

      <daily-totals
        v-for="day in daysInMonth"
        :key="day"
        :day="day"
        :date="getDay(day)"
        :blocks="dailyBlocks"
        :ocf-edit="ocfEdit"
      />
    </div>
  </main>
</template>
