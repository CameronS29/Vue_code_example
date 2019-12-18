<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { DateTime } from 'luxon';

  import * as consts from 'store/modules/scheduling/consts';
  import {
    SET_REVISION,
    SET_DATE,
    SET_SANDBOX,
  } from 'store/modules/fdt/calendar';

  import BottomPopper from 'Common/BottomPopper.vue';
  import Calendar from '../../FDT/Calendar/Calendar.vue';
  import Totals from '../../FDT/Calendar/Partials/Totals.vue';
  import timezones from '../../FDT/utils/timezones';

  const DEFAULT_TIMEZONE = 'UTC';

  export default {
    name: "embed-fdt-calendar",

    components: {
      BottomPopper,
      Calendar,
      Totals,
    },

    async created() {
      this.syncFDTAndSchedulingParams();

      if (this.showFDTCalendarPilot) {
        await this.setPilot(this.showFDTCalendarPilot.id);
      }
    },

    computed: {
      ...mapState('scheduling/calendar', {
        scheduleYear: 'year',
        scheduleMonth: 'month',
        showFDTCalendarPilot: 'showFDTCalendarPilot'
      }),
      ...mapState('app', ['windowHeight']),
      ...mapState('scheduling/calendar/filters', ['actual']),
      ...mapGetters('fdt/calendar', ['isLoading', 'date', 'tz', 'year', 'month']),
      ...mapGetters('scheduling/revisions', ['activeRevision']),

      header() {
        return this.showPopper
          ? `${this.showFDTCalendarPilot.first_name} ${this.showFDTCalendarPilot.last_name}`
          : '';
      },

      showPopper() {
        return this.showFDTCalendarPilot !== null;
      },

      editableTz: {
        get() {
          return this.tz;
        },
        set(value) {
          this.setTimezone(value);
        },
      },

      editableDate: {
        get() {
          return this.date.toJSDate();
        },
        set(value) {
          const date = DateTime
            .fromJSDate(value)
            .setZone(this.tz, {keepCalendarTime: true});

          const isSameAsScheduleDate = (
            date.year === this.scheduleYear
            && date.month === this.scheduleMonth
          );

          this[SET_DATE](date);
          this[SET_REVISION](
            isSameAsScheduleDate
              ? this.activeRevision.id
              : undefined
          );
          this.update();
        },
      },

      height() {
        return `${Math.max(this.windowHeight * 0.42, 400)}px`;
      },
    },

    methods: {
      ...mapActions('fdt/calendar', [
        'setPilot',
        'setRevision',
        'setDate',
        'setTimezone',
        'getLegality',
      ]),

      ...mapMutations('fdt/calendar', [
        SET_REVISION,
        SET_DATE,
        SET_SANDBOX,
      ]),

      ...mapMutations('scheduling/calendar', [
        consts.SET_SHOW_FDT_CALENDAR_PILOT,
        consts.SET_HIGHLIGHTED_PILOT,
      ]),

      handleCloseClick() {
        this[consts.SET_SHOW_FDT_CALENDAR_PILOT](null);
        this[consts.SET_HIGHLIGHTED_PILOT](null);
      },

      update() {
        if (this.showPopper) {
          return this.getLegality();
        }
      },

      syncFDTAndSchedulingParams() {
        this[SET_REVISION](this.activeRevision.id);
        this[SET_SANDBOX]();
        this[SET_DATE](DateTime.fromObject({
          year: this.scheduleYear,
          month: this.scheduleMonth,
          day: 1,
          zone: DEFAULT_TIMEZONE,
        }));
      },
    },

    data() {
      return { timezones };
    },

    watch: {
      activeRevision() {
        this.syncFDTAndSchedulingParams();
      },
      async showFDTCalendarPilot(pilot) {
        if (pilot !== null) {
          await this.setPilot(pilot.id);
        }
      },

      actual: 'update',
    },
  };
</script>

<template>
  <bottom-popper
    class="embed-fdt-calendar"
    :show="showPopper"
    @close="handleCloseClick"
    header-height="74px"
    :max-height="height"
  >
    <header slot="header">
      {{ header }}
      <el-date-picker
        class="embed-fdt-calendar__datepicker"
        type="month"
        :clearable="false"
        format="MM/yyyy"
        v-model="editableDate"
      />

      <el-select v-model="editableTz" class="assigned-flight-list__timezone-picker">
        <el-option
          v-for="timezone in timezones"
          :key="timezone[0]"
          :label="timezone[0]"
          :value="timezone[1]">
        </el-option>
      </el-select>
    </header>

    <totals slot="separator" class="embed-fdt-calendar__totals"/>

    <calendar
      v-if="showFDTCalendarPilot"
      :year="year"
      :month="month"
      :pilot-id="showFDTCalendarPilot.id"
    />
  </bottom-popper>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .embed-fdt-calendar {

    &__datepicker {
      margin-left: 15px;
      max-width: 120px;
    }

    &__totals {
      margin-top: -7px;
    }

    .calendar__body_block .block-info, .calendar__body_shift .block-info {
      border-radius: 4px 4px 0 0;
      box-shadow: 0 0 50px rgba(0, 0, 0, .15)
    }
  }
</style>
