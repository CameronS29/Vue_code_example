<script>
  import isValid from 'date-fns/isValid';
  import toDate from 'date-fns/toDate';
  import min from 'date-fns/min';
  import max from 'date-fns/max';
  import differenceInSeconds from 'date-fns/differenceInSeconds';

  import { isNaN, padStart } from 'lodash';
  import { mapGetters, mapMutations, mapActions } from 'vuex';
  import { SET_FLIGHT } from 'store/modules/flights/index';

  const SECONDS_IN_DAY = 60 * 60 * 24;

  export default {
    props: {
      flight: {
        type: Object,
        required: true,
      },

      options: {
        type: Object,
        required: true,
      },
    },

    computed: {
      ...mapGetters('reports/delay-gantt', [
        'weekDateRange',
        'weekStartDate',
        'minuteOffset',
      ]),

      daysInRange() {
        const diff = differenceInSeconds(this.weekDateRange[1], this.weekDateRange[0]);
        return diff / SECONDS_IN_DAY;
      },

      endStartDiff() {
        const blockStart = isValid(this.flight.datetime_out)
          ? min([this.flight.scheduled_departure, this.flight.datetime_out])
          : toDate(this.flight.scheduled_departure);

        const blockEnd = isValid(this.flight.datetime_in)
          ? max([this.flight.scheduled_arrival, this.flight.datetime_in])
          : toDate(this.flight.scheduled_arrival);

        return differenceInSeconds(blockEnd, blockStart) / SECONDS_IN_DAY;
      },

      style() {
        const blockStart = min([this.flight.scheduled_departure, this.flight.datetime_out]);
        const sectionStartDiff = differenceInSeconds(blockStart, this.weekStartDate.toJSDate()) / SECONDS_IN_DAY;

        return {
          left: `${this.daysToPercents(sectionStartDiff)}%`,
          width: `${this.daysToPercents(this.endStartDiff)}%`,
        };
      },

      departureDelay() {
        const delay = this.flight.departure_delay / 60;
        return isNaN(delay) ? 0 : delay;
      },
      arrivalDelay() {
        const delay = this.flight.arrival_delay / 60;
        return isNaN(delay) ? 0 : delay;
      },

      formattedDepartureDelay() {
        return this.minutesToTimeSimple(this.departureDelay);
      },
      formattedArrivalDelay() {
        return this.minutesToTimeSimple(this.arrivalDelay);
      },

      departureDelayStyles() {
        return { width: `${this.minutesToInnerPercents(this.departureDelay)}%` };
      },
      arrivalDelayStyles() {
        return { width: `${this.minutesToInnerPercents(this.arrivalDelay)}%` };
      },

      scheduledStyle() {
        const departureDelay = Math.min(this.departureDelay, 0);
        const shift = this.minutesToInnerPercents(-departureDelay);
        return { left: `${shift}%`, width: `${100 - shift}%` };
      },

      actualStyle() {
        const arrivalDelay = Math.min(this.arrivalDelay, 0);
        const shift = this.minutesToInnerPercents(-arrivalDelay);
        return { width: `${100 - shift}%` };
      },

      delayClasses() {
        const delay = this.flight.flightlog__delay__name;
        if (delay === null) {
          return { 'delay-gantt-flight__delay': true };
        }
        return {
          'delay-gantt-flight__delay': true,
          [`delay-gantt-flight__delay_${delay.toLowerCase().replace(' ', '-')}`]: true,
        };
      },
    },

    methods: {
      ...mapMutations('flights', [SET_FLIGHT]),
      ...mapActions('flights', ['fetchFlight', 'fetchFlightStatuses']),
      daysToPercents(days) {
        return (100 * days) / this.daysInRange;
      },
      minutesToInnerPercents(minutes) {
        return (100 * minutes) / (60 * 24 * this.endStartDiff);
      },
      async showDetailView() {
        await this.fetchFlight(this.flight.id);
      },
      minutesToTimeSimple(minutes) {
        const hours = Math.trunc(minutes / 60).toString();
        const remMins = Math.trunc(minutes % 60).toString();
        return `${hours.padStart(2, '0')}:${remMins.padStart(2, '0')}`;
      },

      formatTime(datetime) {
        if (!isValid(datetime)) return '—';
        const { minuteOffset: off } = this;

        const offsetHours = ((+datetime.slice(11, 13) + 24) + Math.floor(off / 60)) % 24;
        const offsetMinute = ((+datetime.slice(14, 16) + 60) + (off % 60)) % 60;

        return `${padStart(offsetHours, 2, '0')}:${padStart(offsetMinute, 2, '0')}`;
      },
    },
  };
</script>

<template>
  <div @click="showDetailView" :style="style" class="delay-gantt-flight">
    <div class="delay-gantt-flight__actual" :style="actualStyle">
      <div v-if="departureDelay > 0" :style="departureDelayStyles" :class="delayClasses">
        <span v-if="departureDelay > 15">{{ formattedDepartureDelay }}</span>
      </div>

      <div class="delay-gantt-flight__info">
        <span class="delay-gantt-flight__time">
          <span v-if="options.displayTime">{{ formatTime(flight.datetime_out) }}</span>
        </span>
        <span class="delay-gantt-flight__title">
          <span v-if="options.displayOrigin">{{ flight.origin__iata }} &rarr;</span>
          <span v-if="options.displayDestination">{{ flight.destination__iata }}</span>
          <strong>{{ flight.flight_number }}</strong>
        </span>
        <span class="delay-gantt-flight__time">
          <span v-if="options.displayTime">{{ formatTime(flight.datetime_in) }}</span>
        </span>
      </div>
    </div>

    <div class="delay-gantt-flight__sched" :style="scheduledStyle">
      <div class="delay-gantt-flight__info">
        <span class="delay-gantt-flight__time">
          <span v-if="options.displayTime">{{ formatTime(flight.scheduled_departure) }}</span>
        </span>
        <span class="delay-gantt-flight__title">
          <span v-if="options.displayOrigin">{{ flight.origin__iata }} &rarr;</span>
          <span v-if="options.displayDestination">{{ flight.destination__iata }}</span>
          <strong>{{ flight.flight_number }}</strong>
        </span>
        <span class="delay-gantt-flight__time">
          <span v-if="options.displayTime">{{ formatTime(flight.scheduled_arrival) }}</span>
        </span>
      </div>

      <div v-if="arrivalDelay > 0" :style="arrivalDelayStyles" :class="delayClasses">
        <span v-if="arrivalDelay > 15">{{ formattedArrivalDelay }}</span>
      </div>
    </div>

  </div>
</template>

<style lang="scss">
  @import "../colors";

  .delay-gantt-flight {
    height: 100%;
    font-size: 10px;
    text-align: center;
    line-height: 15px;
    line-break: strict;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #fff;
    position: absolute;
    cursor: pointer;

    &__actual, &__sched {
      position: relative;
      display: flex;
      align-items: stretch;
    }

    &__actual &__info { background: $actual-background; }
    &__sched &__info { background: $scheduled-background; }


    &__sched {
      margin-top: -1px;
      border-top: 1px solid transparentize($actual-background, .9);
    }

    &__info {
      display: flex;
      justify-content: space-between;
      flex: 1 1;
      padding: 0 4px;
      overflow-x: hidden;
      text-overflow: ellipsis;
    }

    &__time {
      font-weight: bold;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    &__delay {
      background: $red;
      font-weight: bold;
      padding: 0 4px;
      overflow: hidden;
      text-overflow: ellipsis;

      @each $type, $color in $errors {
        &_#{$type} { background: $color; }
      }
    }
  }
</style>
