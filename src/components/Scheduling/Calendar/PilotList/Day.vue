<script>
  import { DateTime } from 'luxon';
  import { mapMutations, mapActions } from 'vuex';

  import { Message } from 'element-ui';
  import Modal from 'Common/Modal.vue';
  import { LUXON_US_DATE_FORMAT, SET_HOVERED_DATE } from 'store/modules/scheduling/consts';

  import ButtonEl from 'Common/Button.vue';
  import DayRecord from './Records/DayRecord.vue';
  import DayManifest from './Records/DayManifest.vue';

  export default {
    props: {
      pilotId: Number,
      blocks: {
        type: Array,
        default: () => ([]),
      },
      manifests: {
        type: Array,
        default: () => ([]),
      },
      date: DateTime,

      isHoliday: {
        type: Boolean,
        default: false,
      },

      isInBatchSelection: {
        type: Boolean,
        default: false,
      },

      isPreferredOff: {
        type: Boolean,
        default: false,
      },
      hasInitial: {
        type: Boolean,
        default: true,
      },
    },

    components: {
      ButtonEl,
      DayRecord,
      DayManifest,
      Modal,
    },

    computed: {
      classes() {
        const { weekday } = this.date;
        return {
          'scheduling-calendar-day': true,
          'scheduling-calendar-day_is-weekend': weekday === 6 || weekday === 7,
          'scheduling-calendar-day_is-preferred-off': this.isPreferredOff,
          'scheduling-calendar-day_is-holiday': this.isHoliday,
          'scheduling-calendar-day_batch-highlighted': this.isInBatchSelection,
        };
      },
    },

    methods: {
      ...mapActions('scheduling/calendar/pairBinding', [
        'showPairBinding',
        'startRangePairBinding',
        'endRangePairBinding',
      ]),
      ...mapMutations('scheduling/calendar/pairBinding', [
        SET_HOVERED_DATE,
      ]),

      getCoordinates() {
        const isSmallScreen = window.matchMedia('(min-width: 992px)').matches;
        const clientRect = this.$el.getBoundingClientRect();
        const mainContainerScrollTop = document.querySelector('html').scrollTop;

        return {
          x: (isSmallScreen
            ? `${clientRect.left - 2}px`
            : `${window.innerWidth / 2 - 30}px`),
          y: (isSmallScreen ? `${clientRect.top + mainContainerScrollTop}px` : '20px'),
        };
      },

      handlePickDay(e) {
        const date = this.date.toFormat(LUXON_US_DATE_FORMAT);

        if (this.hasInitial && this.date < DateTime.local().startOf('day')) {
          return Message.error('You can\'t edit past data');
        }

        if (e.shiftKey) {
          e.preventDefault();

          if (this.isInBatchSelection) {
            return this.endRangePairBinding({
              coordinates: this.getCoordinates(),
              date,
            });
          }
          return this.startRangePairBinding({
            pilotId: this.pilotId,
            date,
          });
        }

        return this.showPairBinding({
          pilotId: this.pilotId,
          coordinates: this.getCoordinates(),
          date,
        });
      },

      handleMouseOver() {
        this[SET_HOVERED_DATE](this.date);
      },
    },
  };
</script>

<template>
  <div :class="classes" @click="handlePickDay" @mouseover="handleMouseOver">
    <span class="scheduling-calendar-day__preferred-off" v-if="isPreferredOff">
      OFF
    </span>
    <day-manifest v-for="manifest in manifests" :key="manifest.id" :manifest="manifest" />
    <day-record v-for="block in blocks" :key="block.id" :block="block" />
  </div>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .scheduling-calendar-day {
    min-width: 34px;
    flex: 0 0 34px;
    flex-flow: column;
    align-items: stretch;
    flex-flow: column;
    position: relative;
    cursor: pointer;
    transition: background-color .1s;

    &_weekend {
      background-color: rgba(0, 0, 0, .05);
    }

    &_holiday {
      background-color: oldlace;
    }

    &_batch-highlighted {
      background-color: transparentize($brand-info, .8);
    }

    &:not(:last-of-type) {
      border-right: 1px solid #dfeceb;
    }

    &__preferred-off {
      background-color: transparentize($blue, .92);
      color: transparentize($blue, .6);
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      text-align: center;
      padding-top: 3px;
    }
  }
</style>
