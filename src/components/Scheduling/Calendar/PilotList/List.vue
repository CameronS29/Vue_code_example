<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
  import { findIndex, isArray, keyBy, sortBy, map, range, pick } from 'lodash';
  import { DateTime } from 'luxon';

  import * as consts from 'store/modules/scheduling/consts';
  import PilotListItem from './PilotListItem.vue';
  import CalendarListItem from './CalendarListItem.vue';
  import TotalsListItem from './TotalsListItem.vue';
  import DayHeader from './DayHeader.vue';
  import Divider from './Divider.vue';
  import TotalsHeaderItem from './TotalsHeaderItem.vue';

  import { connectMixin } from '../../../../sockets';


  export default {
    name: 'PilotList',
    mixins: [connectMixin(vm => (`scheduling:${vm.activeRevision.id}`))],

    components: {
      PilotListItem,
      CalendarListItem,
      TotalsListItem,
      TotalsHeaderItem,
      DayHeader,
      Divider,
    },

    data() {
      return {
        ...pick(consts, ['FIRST_NAME', 'LAST_NAME', 'BASE', 'RANK', 'SENIORITY', 'EMPLOYEE']),
        currentDate: DateTime.local(),
        dateTimerId: setInterval(this.updateCurrentDate, 1800000),
      };
    },

    async created() {
      this.getHolidays({ year: this.date.toJSDate() });
    },

    computed: {
      ...mapState('app', ['isShiftPressed']),
      ...mapState('scheduling/calendar', [
        'year',
        'month',
        'showAssignedFlightsDate',
        'isPilotView',
        'highlightedPilotId',
      ]),
      ...mapState('scheduling/assignedFlights', ['assignedFlightStatus']),
      ...mapState('scheduling/calendar/sort', ['sortBy']),
      ...mapGetters('scheduling/pairingTemplates/holidays', ['holidayList']),
      ...mapGetters('scheduling/calendar/pilotGrid', {
        pilots: 'sortedPilots',
        pilotRecordMap: 'pilotRecordMap',
        isLoading: 'isLoading',
      }),
      ...mapGetters('scheduling/calendar', ['date']),
      ...mapGetters('scheduling/revisions', ['activeRevision', 'hasInitial']),
      ...mapState('scheduling/calendar/pairBinding', {
        dateRange: 'dateRange',
        activePilotId: 'pilotId',
        hoveredDate: 'hoveredDate',
      }),

      datesList() {
        if (this.date === undefined) {
          return [];
        }
        const daysInMonth = this.date.daysInMonth;
        return map(range(1, daysInMonth + 1), day => this.date.set({ day }));
      },

      holidayMap() {
        const { year, month } = this;
        const thisMonthDates = this.holidayList
          .filter(date => (date.getFullYear() === year && date.getMonth() === (month - 1)));
        const days = thisMonthDates.map(date => date.getDate());
        return keyBy(days);
      },

      showActualHours() {
        return new Date() >= this.date.startOf('month').toJSDate();
      },

      classes() {
        return {
          'pilot-grid': true,
          'pilot-grid_shift-pressed': this.isShiftPressed,
        };
      },

      headers() {
        return [
          this.$refs.pilotHeader,
          this.$refs.calendarHeader,
          this.$refs.totalsHeader,
        ];
      },

      batchDateRange() {
        if (!this.dateRange[0]) return [0, -1];

        const startDate = DateTime.fromFormat(this.dateRange[0], consts.LUXON_US_DATE_FORMAT);
        const endDate = this.hoveredDate;
        return sortBy([startDate, endDate]);
      },
    },

    methods: {
      ...mapMutations('scheduling/calendar/sort', [
        consts.CHANGE_SORT,
        consts.CHANGE_DAY_SORT,
      ]),
      ...mapMutations('scheduling/calendar', [
        consts.SET_SHOW_ASSIGNED_FLIGHTS_DATE,
      ]),
      ...mapActions('scheduling/assignedFlights', ['getAssignedFlights', 'getAssignedPairs']),
      ...mapActions('scheduling/pairingTemplates/holidays', ['getHolidays']),

      sortByField(fields) {
        fields = isArray(fields) ? fields : [fields];
        this[consts.CHANGE_SORT](fields);
      },

      isSortedByString(fields) {
        fields = isArray(fields) ? fields : [fields];

        if (fields.filter(field => this.sortBy[field] === 'asc').length === fields.length) return '↓';
        if (fields.filter(field => this.sortBy[field] === 'desc').length === fields.length) return '↑';

        return ' ';
      },
      /**
       * Next 3 methods here for performance reasons.
       * Please don't refactor it Vue way.
       */
      dropRowHighlight() {
        const highlighted = this.$el.querySelectorAll('.items .list-item_hovered');
        if (highlighted.length > 0) {
          highlighted.forEach(el => el.classList.remove('list-item_hovered'));
        }
      },

      addRowHighlight(index) {
        const toHighlight = this.$el.querySelectorAll(`.items .list-item:nth-child(${index + 1})`);
        if (toHighlight.length > 0) {
          toHighlight.forEach(el => el.classList.add('list-item_hovered'));
        }
      },
      handleRowHover(pilotId) {
        this.dropRowHighlight();
        this.addRowHighlight(findIndex(this.pilots, pilot => (pilot.pilot.id === pilotId)));
      },

      getCalendarHeaderColumnClass(day) {
        return {
          column: true,
          highlighted: this.assignedFlightStatus[day] !== undefined,
        };
      },

      async handleCalendarDayClick(date) {
        if (this.isPilotView) return false;

        const dateStr = date.toISODate();
        await this.getAssignedFlights(dateStr);
        await this.getAssignedPairs(dateStr);

        this[consts.SET_SHOW_ASSIGNED_FLIGHTS_DATE](dateStr);
        return true;
      },

      updateCurrentDate() {
        this.currentDate = DateTime.local();
      },
    },

    watch: {
      year() {
        this.getHolidays({ year: this.date.toJSDate() });
      },
    },
  };
</script>

<template>
  <div @mouseleave="dropRowHighlight" :class="classes" v-loading="isLoading">
    <section class="pilot-related-wrapper">
      <div class="pilot-related">
        <header ref="pilotHeader">
          <div class="column" @click="sortByField([FIRST_NAME, LAST_NAME])">
            Name
            <span class="arrow">{{ isSortedByString([FIRST_NAME, LAST_NAME]) }}</span>
          </div>
          <div v-if="!isPilotView" class="column" @click="sortByField(BASE)">
            Base
            <span class="arrow">{{ isSortedByString(BASE) }}</span>
          </div>
          <div v-if="!isPilotView" class="column" @click="sortByField(RANK)">
            Rank
            <span class="arrow">{{ isSortedByString(RANK) }}</span>
          </div>
          <div v-if="!isPilotView" class="column" @click="sortByField(SENIORITY)" title="Seniority">
            S
            <span class="arrow">{{ isSortedByString(SENIORITY) }}</span>
          </div>
          <div v-if="!isPilotView" class="column" @click="sortByField(EMPLOYEE)" title="Employee#">
            E#
            <span class="arrow">{{ isSortedByString(EMPLOYEE) }}</span>
          </div>
        </header>
        <section class="items">
          <pilot-list-item
            @hover-pilot-row="handleRowHover"
            v-for="pilot in pilots"
            :key="pilot.pilot.id"
            :is-pilot-view="isPilotView"
            :active-pilot-id="activePilotId"
            :pilot="pilot.pilot"
            :totals="pilot.totals"
            :max-length="pilotRecordMap[pilot.pilot.id].maxLength"
            :highlighted="pilot.pilot.id === highlightedPilotId"
          />
        </section>
      </div>
    </section>

    <section class="calendar-wrapper" :style="{maxWidth: `calc(34px * ${date.daysInMonth})`}">
      <header ref="calendarHeader"
              v-scroll-sync="{ id: 'crew-calendar', y: false }"
              class="horizontal-scrollable">
        <div class="scrollable-header" :style="{width: `calc(34px * ${date.daysInMonth})`}">
          <day-header
            v-for="date in datesList"
            :key="date.day"
            @click.native="handleCalendarDayClick(date)"
            :class="getCalendarHeaderColumnClass(date.day)"
            :date="date"
          />
        </div>
      </header>

      <section class="items horizontal-scrollable"
               v-scroll-sync="{ id: 'crew-calendar', y: false }"
               ref="calendarContent">
        <div :style="{width: `calc(34px * ${date.daysInMonth})`}">
          <calendar-list-item
            @hover-pilot-row="handleRowHover"
            v-for="pilot in pilots"
            :key="pilot.pilot.id"
            :dates="datesList"
            :holidays="holidayMap"
            :selection-range="batchDateRange"
            :active-pilot-id="activePilotId"
            :highlighted="pilot.pilot.id === highlightedPilotId"
            :has-initial="hasInitial"
            v-bind="pilotRecordMap[pilot.pilot.id]"
          />
          <divider :current-date="currentDate" />
        </div>
      </section>
    </section>

    <section class="totals-wrapper">
      <div class="totals-title">
        <label>TOTALS</label>
      </div>
      <div class="totals">
        <header ref="totalsHeader">
          <totals-header-item v-if="showActualHours" title="SXH" description="SX Hours" />
          <totals-header-item v-if="showActualHours" title="HRS" description="Actual Flown Hours" />
          <totals-header-item title="TOT" description="Actual Flown + Remaining Scheduled Hours" />
          <totals-header-item title="OFF" description="Days Off" />
          <totals-header-item title="PAID" description="Paid Off Days" />
          <totals-header-item title="SICK" description="Sick Days" />
        </header>

        <section class="items">
          <totals-list-item
            @hover-pilot-row="handleRowHover"
            v-for="pilot in pilots"
            :key="pilot.pilot.id"
            :show-sx-hours="showActualHours"
            :show-actual-hours="showActualHours"
            :is-pilot-view="isPilotView"
            :active-pilot-id="activePilotId"
            :pilot="pilot.pilot"
            :totals="pilot.totals"
            :max-length="pilotRecordMap[pilot.pilot.id].maxLength"
            :highlighted="pilot.pilot.id === highlightedPilotId"
          />
        </section>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .pilot-grid {
    display: flex;

    &_shift-pressed {
      .day:hover {
        background-color: transparentize($brand-info, .8) !important;
      }
    }
    > section {
      background: #fff;
      border: 1px solid #dfeceb;
      header {
        height: 40px;
        line-height: 40px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        z-index: 10;
        position: relative;

        .column {
          position: relative;
          background: #eef6f6;
          color: #1f3d3a;

          .arrow {
            position: absolute;
            top: 0;
            right: 0;
            display: inline-block;
            min-width: 10px;
          }
        }
      }
      .items {
        display: flex;
        flex-flow: column;
        .list-item {
          display: flex;
          padding: 0 10px;
          justify-content: space-between;
          &_hovered {
            background-color: rgba(0, 0, 0, .04);
          }
          &_highlighted {
            background-color: rgba(0, 0, 0, .05);
          }
          &:not(:last-of-type) {
            border-bottom: 1px solid #dfeceb;
          }
          .column {
            display: flex;
            align-items: center;

          }
        }
      }

      &.pilot-related-wrapper, &.totals-wrapper {
        flex: 0 0 auto;
      }

      &.pilot-related-wrapper {
        @media screen and (max-width: $screen-xs-max) {
          max-width: 100px;
          overflow-x: auto;
        }
      }

      &.totals-wrapper {
        margin-left: 15px;
        position: relative;
        @media screen and (max-width: $screen-sm-max) {
          max-width: 70px;
          margin-left: 0;
          overflow-x: auto;
        }
        .totals-title {
          position: absolute;
          top: -30px;
          left: 8px;
          @media screen and (max-width: $screen-sm-max) {
            display: none;
          }
          label {
            margin: 0;
          }
        }
      }

      .pilot-related, .totals {
        display: table;
        .items {
          display: table-row-group;
          .column {
            display: table-cell;
            padding: 0 10px;
            vertical-align: middle;

          }
        }
        header {
          display: table-header-group;
          .column {
            display: table-cell;
            padding: 0 10px;
            position: sticky;
            top: 0;
          }
        }
        .list-item {
          display: table-row;
          &:not(:last-of-type) {
            .column {
              border-bottom: 1px solid #dfeceb;
            }
          }
          .column {
            white-space: nowrap;
          }
        }
      }

      .pilot-related {
        header {
          .column {
            cursor: pointer;
          }
        }
      }

      .totals {
        flex: 0 0 auto;
        header {
          border-bottom: 3px solid #337ab7;
        }
      }

      &.calendar-wrapper {
        border-left: none;
        flex: 1 1 auto;
        width: 0;

        header {
          text-align: center;
          position: sticky;
          top: 0;

          .column {
            cursor: pointer;
            border-bottom: 3px solid #337ab7;

            &.highlighted {
              border-bottom-color: #f8ac59;
            }
          }
        }

        .horizontal-scrollable {
          overflow-x: auto;
          display: flex;
          justify-content: flex-start;
          will-change: transform;

          &::-webkit-scrollbar {
            display: none;
          }

          .scrollable-header {
            display: flex;
          }
        }

        .items {
          position: relative;

          .list-item {
            padding-left: 0;
            padding-right: 0;
            justify-content: flex-start;
          }
        }
        .column {
          min-width: 34px;
          flex: 0 0 34px;
        }
      }

    }

  }
</style>
