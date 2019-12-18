<script>
  import { DateTime } from 'luxon';
  import IANAZone from 'luxon/src/zones/IANAZone';

  import { range, throttle, map } from 'lodash';
  import { nullPad } from 'utils/date';

  const HIGHLIGHTED_ROW_CLASS = 'gantt-table__highlighted-row';
  const UTC = new IANAZone('UTC');
  const ELEMENT_NODE_TYPE = 1;

  export default {
    props: {
      range: Number,
      dateRange: {
        type: Array,
        required: true,
      },
      defaultDate: {
        type: [Boolean, DateTime],
        default: false,
      },
      rowClass: {
        type: String,
        default: 'gantt-table__row',
      },
      minuteOffset: {
        type: Number,
        default: 0,
      },
      hourPads: {
        type: Boolean,
        default: false,
      },
      richHeader: {
        type: Boolean,
        default: false,
      },
      hiddenHeader: {
        type: Boolean,
        default: false,
      },
      scrollSync: {
        type: [Object, Boolean],
        default: false,
      },
      updateTrigger: {
        type: Number,
        default: 0,
      },
    },

    data() {
      return {
        blockTimesWrapperWidth: null,
        blockTimesWrapperHeight: null,

        observableDate: false,
        mutationRecords: null,
        currentTime: DateTime.local(),
      };
    },

    async mounted() {
      this.specifyBlockTimesWrapperSize();
      this.startCurrentTimeTick();
      await this.$nextTick();

      this.observer = new MutationObserver((records) => { this.mutationRecords = records; });
      this.observer.observe(this.$refs.blockTimes, { childList: true });
      this.observer.observe(this.$refs.fixed, { childList: true });

      if (this.defaultDate) {
        this.scrollToInitialDate();
      }
      this.startRowHighlighting();
    },

    destroyed() {
      clearInterval(this.tickTimer);
      this.observer.disconnect();
    },

    computed: {
      dateTimedDateRange() {
        return [
          DateTime.fromISO(this.dateRange[0], { zone: UTC }).startOf('day'),
          DateTime.fromISO(this.dateRange[1], { zone: UTC }).endOf('day'),
        ];
      },
      daysInRange() {
        return Math.ceil(this.dateTimedDateRange[1].diff(this.dateTimedDateRange[0], 'days').days);
      },
      days() {
        return range(0, this.daysInRange)
          .map(days => this.dateTimedDateRange[0].plus({ days }));
      },
      dayCounterStyles() {
        return {
          width: `${100 / this.daysInRange}%`,
          flex: `0 0 ${100 / this.daysInRange}%`,
        };
      },
      dividersStyles() {
        return {
          width: `${this.daysToPixels(this.daysInRange)}px`,
          height: `${this.blockTimesWrapperHeight}px`,
        };
      },
      hoveredTimeStyles() {
        return {
          height: `${this.blockTimesWrapperHeight}px`,
        };
      },
      dividerStyles() {
        return {
          width: `${100 / this.daysInRange}%`,
        };
      },
      wrapperStyle() {
        return {
          width: `${this.daysToPixels(this.daysInRange)}px`,
          paddingTop: this.hiddenHeader ? 0 : '17px',
        };
      },
      timelineStyle() {
        return {
          width: `${this.daysToPixels(this.daysInRange)}px`,
        };
      },
      tableClasses() {
        return {
          'gantt-table': true,
          'gantt-table_3': this.range >= 3,
          'gantt-table_7': this.range >= 7,
          'gantt-table_10': this.range >= 10,
        };
      },
      currentTimeStyle() {
        const sectionStart = this.dateTimedDateRange[0];
        const currentTime = this.currentTime.plus({ minutes: this.minuteOffset });
        const diff = currentTime.diff(sectionStart, 'days').as('days');

        return {
          left: `${this.daysToPixels(diff)}px`,
          height: `${this.blockTimesWrapperHeight}px`,
        };
      },
      showCurrentTime() {
        const currentDate = this.currentTime.setZone(UTC);
        return (currentDate > this.dateTimedDateRange[0]) && (currentDate < this.dateTimedDateRange[1]);
      },
      headerDateFormat() {
        return this.richHeader ? 'EEE, MMM dd' : 'dd';
      },
      syncScrollId() {
        return `gantt-table-internal${Math.random()}`;
      },
    },

    methods: {
      scrollToInitialDate() {
        this.scrollToDate({ date: this.defaultDate });
      },
      scrollToDate({ date, animated = false, centred = false }) {
        const diff = date.diff(this.dateTimedDateRange[0], 'days');
        const wrapperWidth = this.$refs.blockTimesWrapper.offsetWidth;

        this.$refs.blockTimesWrapper.scroll({
          left: this.daysToPixels(diff.days) - (centred ? (wrapperWidth / 2) : 0),
          behavior: animated ? 'smooth' : 'instant',
        });
      },
      daysToPixels(days) {
        return (days * this.blockTimesWrapperWidth) / this.range;
      },
      xToDateTime(xCoordinate) {
        const days = (this.range * xCoordinate) / this.blockTimesWrapperWidth;
        return this.dateTimedDateRange[0].plus({ minutes: days * 24 * 60 });
      },
      daysToPercents(days) {
        return (100 * days) / this.daysInRange;
      },
      handleBlockTimesWrapperMouseMove(e) {
        if (this.hiddenHeader) return;

        const bounds = this.$refs.blockTimesWrapper.getBoundingClientRect();
        const x = (e.clientX - bounds.left) + this.$refs.blockTimesWrapper.scrollLeft;
        Object.assign(this.$refs.hoveredTime.style, {
          display: 'block',
          left: `${x}px`,
        });

        const dateTime = this.xToDateTime(x);
        this.$emit('blocktime-wrapper-hover', { x, dateTime });
        this.$refs.hoveredTimeText.textContent = dateTime.toLocaleString(DateTime.TIME_24_SIMPLE);
      },
      handleBlockTimesWrapperMouseOut() {
        if (this.hiddenHeader) return;

        this.$refs.hoveredTime.style.display = 'none';
        this.clearHighlightedRows();
      },
      handleWrapperScroll() {
        this.observableDateChange();
      },
      observableDateChange: throttle(function () {
        this.observableDate = this.xToDateTime(this.$refs.blockTimesWrapper.scrollLeft);
      }, 200),
      async specifyBlockTimesWrapperSize() {
        await this.$nextTick();
        const { scrollHeight, offsetWidth } = this.$refs.blockTimesWrapper;
        const scrollPosition = this.xToDateTime(this.$refs.blockTimesWrapper.scrollLeft);

        this.blockTimesWrapperWidth = offsetWidth;
        this.blockTimesWrapperHeight = scrollHeight;

        this.scrollToDate({ date: scrollPosition });
      },
      startCurrentTimeTick() {
        this.tickTimer = setInterval(() => {
          this.currentTime = DateTime.local();
        }, 30000);
      },
      startRowHighlighting() {
        [this.$refs.blockTimes, this.$refs.fixed].forEach((el) => {
          el.querySelectorAll(`.${this.rowClass}`)
            .forEach(el => el.addEventListener('mouseover', this.handleRowMouseOver));
        });
      },
      handleRowMouseOver(e) {
        const el = e.currentTarget;
        this.handleHighlightedRowIndexChange([...el.parentNode.children].indexOf(el));
      },
      handleHighlightedRowIndexChange(index) {
        this.clearHighlightedRows();
        [this.$refs.blockTimes, this.$refs.fixed].forEach((wrapper) => {
          const el = wrapper.querySelector(`.${this.rowClass}:nth-child(${index + 1})`);

          if (el) {
            el.classList.add(HIGHLIGHTED_ROW_CLASS);
          }
        });
      },
      clearHighlightedRows() {
        [this.$refs.blockTimes, this.$refs.fixed].forEach((el) => {
          const highlighted = el.querySelector(`.${HIGHLIGHTED_ROW_CLASS}`);
          if (highlighted) highlighted.classList.remove(HIGHLIGHTED_ROW_CLASS);
        });
      },

      async updateNativeEventListeners() {
        this.specifyBlockTimesWrapperSize();

        if (this.mutationRecords === null) return;
        await this.$nextTick();

        const { rowClass } = this;
        const addedNodes = map(this.mutationRecords, 'addedNodes');
        const removedNodes = map(this.mutationRecords, 'removedNodes');

        const nodePredicate = node => (
          node.nodeType === ELEMENT_NODE_TYPE &&
          node.classList.contains(rowClass)
        );

        removedNodes.forEach(nodeList => nodeList.forEach(node => (
          nodePredicate(node) &&
          node.removeEventListener('mouseover', this.handleRowMouseOver)
        )));

        addedNodes.forEach(nodeList => nodeList.forEach(node => (
          nodePredicate(node) &&
          node.addEventListener('mouseover', this.handleRowMouseOver)
        )));
      },
    },

    filters: {
      nullPad(value) {
        return nullPad(value);
      },
    },

    watch: {
      range: 'specifyBlockTimesWrapperSize',
      dateRange() {
        if (this.defaultDate) {
          this.scrollToInitialDate();
        }
      },
      daysInRange: 'specifyBlockTimesWrapperSize',
      updateTrigger: 'specifyBlockTimesWrapperSize',
      mutationRecords: 'updateNativeEventListeners',
      observableDate() {
        this.$emit('date-change', this.observableDate);
      },
    },
  };
</script>

<template>
  <div :class="tableClasses">
    <div ref="fixed"
         v-scroll-sync="{ id: syncScrollId }"
         class="gantt-table__fixed">
      <div class="gantt-table__fixed-header" v-if="!hiddenHeader">
        <slot name="fixed-header" />
      </div>
      <slot name="fixed" />
    </div>
    <div ref="blockTimesWrapper"
         @mousemove="handleBlockTimesWrapperMouseMove"
         @mouseout="handleBlockTimesWrapperMouseOut"
         @scroll="handleWrapperScroll"
         v-scroll-sync="{ id: syncScrollId }"
         v-scroll-sync.outer="scrollSync ? scrollSync : undefined"
         class="gantt-table__block-times-wrapper" >
      <div v-if="showCurrentTime" :style="currentTimeStyle" class="gantt-table__current-time" />

      <div :style="timelineStyle" v-if="!hiddenHeader" class="gantt-table__timeline">
        <span :key="day.toISODate()"
              v-for="day in days"
              :style="dayCounterStyles"
              class="gantt-table__day-counter">
          <span class="gantt-table__day-label">
            <span class="gantt-table__day-text">{{ day.toFormat(headerDateFormat) }}</span>
          </span>
          <span v-for="hour in 23" class="gantt-table__hour-counter">
            <span class="gantt-table__hour-label">
              {{ hour | nullPad }}<span v-if="richHeader">:00</span>
            </span>
            <span class="gantt-table__hour-description">
              <slot name="hour" :date="day" :hour="hour" />
            </span>
          </span>
        </span>

        <div ref="hoveredTime" class="gantt-table__hovered-time" :style="hoveredTimeStyles">
          <span class="gantt-table__hovered-time-text" ref="hoveredTimeText" />
        </div>
      </div>

      <div :style="dividersStyles" class="gantt-table__day-dividers">
        <div :key="day.toISODate()"
             v-for="day in days"
             :style="dividerStyles"
             class="gantt-table__day-divider">
          <div class="gantt-table__hour-divider"
               v-if="hourPads"
               v-for="hour in 23"
               :key="hour" />
        </div>
      </div>

      <div :style="wrapperStyle" ref="blockTimes" class="gantt-table__block-times">
        <slot name="grid" />
      </div>
    </div>
  </div>
</template>


<style lang="scss">
  @import "../../../scss/bs-variables";

  $header-background: #eaeaeb;
  $header-color: $text-color;
  $hour-width: 100% / 24;
  $header-height: 25px;
  $fade-gradient: $header-background, transparentize($header-background, 1);

  .gantt-table {
    display: flex;

    &_3 {
      .gantt-table__hour-counter {
        &:nth-of-type(2n + 1) {
          .gantt-table__hour-label {
            visibility: hidden;
          }
        }
      }
    }

    &_7 {
      .gantt-table__hour-counter {
        .gantt-table__hour-label {
          visibility: hidden;
        }
      }
    }

    &_10 {
      .gantt-table__hour-counter {
        &:nth-of-type(2n - 1) {
          visibility: hidden;
        }
      }
    }

    &__fixed {
      border-right: 1px solid #E3E3E3;
      background: #fff;
      padding: 0;
      z-index: 10;
      white-space: nowrap;
      flex: 0 0 auto;
      overflow-y: scroll;
      border-radius: 3px 0 0 3px;

      &::-webkit-scrollbar {
        display: none;
      }
    }
    &__fixed-header {
      height: $header-height;
      background: $header-background;
      margin-bottom: 17px;
      position: sticky;
      top: 0;
      z-index: 9;
    }

    &__block-times {
      background: #fff;
      padding: 17px 0 0;
      border-radius: 0 3px 3px 0;
      overflow-x: hidden;

      &-wrapper {
        overflow-y: auto;
        overflow-x: auto;
        flex: 1 1;
        position: relative;
        transform: translate3d(0, 0, 0);
      }
    }

    &__current-time {
      left: 0;
      height: 100%;
      position: fixed;
      z-index: 0;
      width: 1px;
      background: #ff6e6e;
    }

    &__hovered-time {
      position: absolute;
      pointer-events: none;
      z-index: 150;
      display: none;

      &:after {
        content: '';
        display: block;
        width: 1px;
        height: 100%;
        background: $blue;
        position: relative;
      }

      &-text {
        display: block;
        background: $header-background;
        font-size: 1.05em;
        color: $blue;
        width: 42px;
        height: $header-height;
        line-height: $header-height;
        z-index: 10;
        left: -21px;
        text-align: center;
        position: absolute;
        font-weight: bold;

        &::before, &::after {
          content: '';
          display: block;
          position: absolute;
          width: 8px;
          height: 100%;
          top: 0;
        }

        &::before {
          right: 100%;
          background: linear-gradient(to left, $fade-gradient);
        }

        &::after {
          left: 100%;
          background: linear-gradient(to right, $fade-gradient);
        }
      }
    }

    &__timeline {
      display: flex;
      height: $header-height;
      position: sticky;
      top: 0;
      background: $header-background;
      color: $header-color;
      z-index: 100;
      margin-left: -1px;
      font-weight: bold;
    }

    &__day-counter {
      display: flex;
      align-items: flex-end;
      position: relative;

      &:before {
        content: '';
        display: block;
        position: absolute;
        height: 14px;
        background: #979797;
        width: 1px;
        left: 1px;
        bottom: -14px;
      }
    }

    &__day-label {
      font-size: 1.2em;
      position: sticky;
      display: inline-block;
      font-weight: bold;
      left: 0;
      top: 0;
      height: $header-height;
      width: $hour-width;
      line-height: $header-height;
      z-index: 1;
      white-space: nowrap;
    }

    &__day-text {
      position: relative;
      background-color: $header-background;

      &::after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 100%;
        height: 100%;
        width: 20px;
        background: linear-gradient(to right, $fade-gradient);
      }
    }

    &__day-dividers {
      height: 100%;
      pointer-events: none;
      display: flex;
      position: fixed;
    }

    &__day-divider {
      display: flex;
      flex-flow: row nowrap;
      flex: 1 1;
      border-left: 1px solid #dfdfdf;

      &:first-child {
        border-color: transparent;
      }
    }

    &__hour-divider {
      width: #{100% / 24};
      border-right: 1px dashed #e4e4e4;
    }

    &__hour-counter {
      width: #{100% / 24};
      padding-bottom: 2px;
      position: relative;

      &::before {
        $pivot-height: 9px;

        content: '';
        display: block;
        position: absolute;
        height: $pivot-height;
        width: 1px;
        background-color: #979797;
        left: .5px;
        bottom: -$pivot-height;
      }
    }

    &__hour-label {
      display: inline-block;
      position: relative;
      white-space: nowrap;
      left: 0;
      transform: translateX(-50%);
      font-size: 1.05em;
      line-height: $header-height * 0.8;
      color: lighten($header-color, 15%)
    }

    &__hour-description {
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      bottom: 50%;
      line-height: 0;
      text-align: center;
      font-size: 0.75em;
      font-style: italic;
      color: lighten($header-color, 25%);
    }

    &__highlighted-row {
      background-color: rgba(81, 144, 255, 0.06);
    }

    &__base {
      border-radius: 3px;
      padding: 0 4px;
      margin-left: 10px;
      color: #fff;
      background-color: #2874b2;
    }
  }
</style>
