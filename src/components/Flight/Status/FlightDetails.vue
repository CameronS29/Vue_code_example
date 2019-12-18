<script>
  import { mapState, mapMutations, mapActions } from 'vuex';
  import { DateTime } from 'luxon';
  import { get, find } from 'lodash';
  import { required } from 'vuelidate/lib/validators';

  import { hoursToTimeSimple } from 'utils/date';
  import { SET_FLIGHT, SET_EDIT_MODE } from 'store/modules/flights/index';
  import { ERROR_STATUSES } from 'store/modules/dispatch/status-change';
  import HorizontalScrollable from 'Common/HorizontalScrollable.vue';
  import ThrottledInput from 'Common/ThrottledInput.vue';

  import { connectMixin } from '../../../sockets/index';
  import StatusLog from './StatusLog.vue';

  import updateFlightMixin, { flightProp } from './updateFlightMixin';

  const parse = date => DateTime.fromISO(date)
    .setZone('UTC');

  const NA_VALUE = '—';
  const DELAY_MARGIN = 15; // minutes

  export default {
    created() {
      window.addEventListener('keydown', this.keyboardClose);
      if (!this.aircraftTypes.length) {
        this.getAircraftTypes();
      }
    },
    destroyed() {
      window.removeEventListener('keydown', this.keyboardClose);
    },
    mixins: [
      updateFlightMixin,
      connectMixin(({flight}) => (flight && `flight:${flight.id}`)),
    ],
    props: {
      zIndex: {
        type: Number,
        default: 100,
      },
    },
    components: {
      StatusLog,
      HorizontalScrollable,
      ThrottledInput,
    },
    data() {
      return { NA_VALUE, ERROR_STATUSES };
    },
    validations: {
      fuel_burn: {
        required,
      },
      fuel_add_amount: {
        required,
      },
    },
    computed: {
      ...mapState('flights', [
        'flight',
        'statusLogs',
        'editMode',
      ]),
      ...mapState('dispatch/flight-list/status-change', [
        'availableFlightStatuses',
        'completionFlightStatuses',
      ]),
      ...mapState('aircraft', ['aircraftTypes']),

      fuel_burn: flightProp('flightlog.fuel_burn'),
      fuel_add_amount: flightProp('flightlog.fuel_add_amount'),
      scheduledBlockTime() {
        const diff = parse(this.flight.scheduled_arrival)
          .diff(parse(this.flight.scheduled_departure), ['hours', 'minutes']).toObject();
        const hours = diff.hours || "00";
        const minutes = diff.minutes ? Math.round(diff.minutes) : "00";
        if (diff) {
          return `${hours}:${minutes}`;
        } else {
          return '-:-';
        }
      },
      actualBlockTime() {
        if (!get(this, 'flight.flightlog.block_time')) return NA_VALUE;

        return hoursToTimeSimple(this.flight.flightlog.block_time);
      },
      actualFlightTime() {
        if (!get(this, 'flight.flightlog.flight_time')) return NA_VALUE;

        return hoursToTimeSimple(this.flight.flightlog.flight_time);
      },
      departureDelayMinCount() {
        let dateTimeOut = get(this, 'flight.flightlog.actual_datetime_out');
        if (!dateTimeOut) dateTimeOut = get(this, 'flight.estimated_departure');
        if (!dateTimeOut) return NA_VALUE;

        const {minutes: diff} = parse(dateTimeOut)
          .diff(parse(this.flight.scheduled_departure), ['minutes']);

        return diff > 0 ? parseInt(diff) : 0;
      },
      arrivalDelayMinCount() {
        let dateTimeIn = get(this, 'flight.flightlog.actual_datetime_in');
        if (!dateTimeIn) dateTimeIn = get(this, 'flight.estimated_arrival');
        if (!dateTimeIn) return NA_VALUE;

        const {minutes: diff} = parse(dateTimeIn)
          .diff(parse(this.flight.scheduled_arrival), ['minutes']);

        return diff > 0 ? parseInt(diff) : 0;
      },
      departureDelayString() {
        const diff = this.departureDelayMinCount;

        return diff ? `delay: ${diff} min` : 'no delay';
      },
      arrivalDelayString() {
        const diff = this.arrivalDelayMinCount;

        return diff ? `delay: ${diff} min` : 'no delay';
      },
      departureDelayClasses() {
        return this.delayClasses(this.departureDelayMinCount);
      },
      arrivalDelayClasses() {
        return this.delayClasses(this.arrivalDelayMinCount);
      },
      esimatesAvalabile() {
        return this.available('flight.estimated_departure');
      },
      isFlown() {
        return this.flight.flightlog;
      },
      isDelayed() {
        return this.departureDelayMinCount >= DELAY_MARGIN || this.arrivalDelayMinCount >= DELAY_MARGIN;
      },
      logStyles() {
        return {
          opacity: this.available('flight.flightlog') ? undefined : 0.15,
        };
      },
      wbLink() {
        return {name: 'wb_log', params: {id: this.flight.wb_log}}
      },
      flightEditMode: {
        get() {
          return this.editMode;
        },
        set(flag) {
          this[SET_EDIT_MODE](flag);
        },
      },
      style() {
        return { zIndex: this.zIndex };
      },
      scheduledPIC() {
        const pilot = this.get('flight.scheduled_pic');

        return pilot !== NA_VALUE ? this.$options.filters.fullName(pilot) : NA_VALUE;
      },
      scheduledSIC() {
        const pilot = this.get('flight.scheduled_sic');

        return pilot !== NA_VALUE ? this.$options.filters.fullName(pilot) : NA_VALUE;
      },
      scheduledAircraftType() {
        if (!this.aircraftTypes.length) return NA_VALUE;

        const type = this.get('flight.scheduled_aircraft_type');
        return type !== NA_VALUE ? find(this.aircraftTypes, { id: type }).name : NA_VALUE;
      },
    },
    methods: {
      ...mapMutations('flights', [SET_FLIGHT, SET_EDIT_MODE]),
      ...mapActions('aircraft', ['getAircraftTypes']),

      handleCloseClick() {
        this[SET_FLIGHT](null);
      },
      keyboardClose(e) {
        if (e.code === 'Escape') this.handleCloseClick();
      },
      available(path) {
        const value = get(this, path);
        return value || value === 0 || value === '0';
      },
      get(path) {
        const value = get(this, path);
        if (value || value === 0 || value === '0') return value;

        return NA_VALUE;
      },
      delayClasses(minCount) {
        return {
          'flight-details__time-block-delay': true,
          'flight-details__time-block-delay_positive': minCount < DELAY_MARGIN,
          'flight-details__time-block-delay_negative': minCount >= DELAY_MARGIN,
        };
      },
      isPropInvalid(prop) {
        return this.$v[prop].$invalid && this.editMode;
      },
    },
    filters: {
      time(value) {
        if (!value || value === NA_VALUE) return NA_VALUE;

        return parse(value)
          .toLocaleString(DateTime.TIME_24_SIMPLE);
      },
      date(value) {
        if (!value || value === NA_VALUE) return NA_VALUE;

        return parse(value)
          .toFormat('MM/dd');
      },
      year(value) {
        if (!value || value === NA_VALUE) return NA_VALUE;

        return parse(value)
          .toFormat('yyyy');
      },
    },
  };
</script>

<template>
  <div
    v-if="flight"
    :style="style"
    class="flight-details">

    <header class="flight-details__header">
      <h1 class="flight-details__flight-desc">Flight #{{ flight.flight_number }}
        {{ flight.origin.iata }}-{{ flight.destination.iata }}</h1>

      <div class="flight-details__badges">
        <span
          v-if="flight.status"
          :class="{
            'flight-details__badge': true,
            'flight-details__badge_green': flight.status !== 3,
            'flight-details__badge_red': flight.status === 3,
        }">
          {{ completionFlightStatuses[flight.completion_status] }}
          <template v-if="flight.status === 3">
            {{ flight.official_code_verbose }}
          </template>
        </span>
        <span v-if="isDelayed || flight.status === 4" class="flight-details__badge flight-details__badge_red">
          Delayed {{ flight.official_code_verbose }}
        </span>
        <span v-else-if="flight.status !== 0 && flight.status !== 3"
              class="flight-details__badge flight-details__badge_green">
          On-time
        </span>
        <router-link :to="wbLink" v-if="flight.wb_pic_pined" class="flight-details__badge flight-details__badge_green">
          WB: PIC confirmed
        </router-link>
        <router-link :to="wbLink" v-if="flight.wb_dispatch_pined"
                     class="flight-details__badge flight-details__badge_green">
          WB: completed
        </router-link>
        <router-link :to="wbLink" v-if="flight.wb_log" class="flight-details__badge flight-details__badge_gray">
          WB: created
        </router-link>
        <span v-if="flight.copied" class="flight-details__badge flight-details__badge_red">
          Copied
        </span>
      </div>

      <!--<div class="flight-details__mode-switch">-->
      <!--inspect-->
      <!--<i class="fa fa-eye"/>-->
      <!--<el-switch class="flight-details__mode-switcher" v-model="flightEditMode"/>-->
      <!--<i class="fa fa-pencil"/>-->
      <!--edit-->
      <!--</div>-->

      <span
        class="flight-details__close"
        @keydown.esc="handleCloseClick"
        @click="handleCloseClick">×</span>
    </header>
    <horizontal-scrollable>
      <section class="flight-details__info">
        <div class="flight-details__info-section flight-details__info-section_time">
          <div class="flight-details__info-section-half-width">
            <div class="flight-details__airport-row">
              <div class="flight-details__airport flight-details__airport_faded">
                <span class="flight-details__airport-title">Scheduled Departure</span>
                <span class="flight-details__airport-value" >
                  {{ flight.origin.iata || flight.origin }}
                </span>
              </div>
              <div class="flight-details__airport flight-details__airport_right-aligned">
                <span class="flight-details__airport-title">Departure</span>
                <span class="flight-details__airport-value" v v-if="flight.actual_origin">
                  {{ flight.actual_origin.iata || flight.actual_origin }}
                </span>
                <span class="flight-details__airport-value" v v-else>
                  {{ flight.origin.iata || flight.origin }}
                </span>
              </div>
            </div>
            <div class="flight-details__time_row">
              <div class="flight-details__time-block flight-details__time-block_bright">
                <span class="flight-details__time-block-title">Scheduled (UTC)</span>
                <div class="flight-details__time-block-data">
                  <span class="flight-details__time-block-date">
                    {{ flight.scheduled_departure | date }}
                    <span class="flight-details__time-block-year">{{ flight.scheduled_departure | year }}</span>
                  </span>
                  <span class="flight-details__time-block-time">{{ flight.scheduled_departure | time }}</span>
                </div>
              </div>
              <div
                :style="logStyles"
                v-if="available('flight.flightlog.actual_datetime_out') || !esimatesAvalabile"
                class="flight-details__time-block">
                <span class="flight-details__time-block-title">OUT (UTC)</span>
                <div class="flight-details__time-block-data">
                  <span v-if="available('flight.flightlog.actual_datetime_out')"
                        class="flight-details__time-block-date">
                    {{ get('flight.flightlog.actual_datetime_out') | date }}
                    <span class="flight-details__time-block-year">
                      {{ get('flight.flightlog.actual_datetime_out') | year }}
                    </span>
                  </span>
                  <span class="flight-details__time-block-time">
                    {{ get('flight.flightlog.actual_datetime_out') | time }}
                  </span>
                </div>
                <span v-if="available('flight.flightlog.actual_datetime_out')" :class="departureDelayClasses">
                  <i class="fa fa-clock-o"/> {{ departureDelayString }}
                </span>
              </div>
              <div :style="logStyles" v-else-if="esimatesAvalabile" class="flight-details__time-block">
                <span class="flight-details__time-block-title">Estimated OUT (UTC)</span>
                <div class="flight-details__time-block-data">
                  <span v-if="available('flight.estimated_departure')"
                        class="flight-details__time-block-date">
                    {{ get('flight.estimated_departure') | date }}
                    <span class="flight-details__time-block-year">
                      {{ get('flight.estimated_departure') | year }}
                    </span>
                  </span>
                  <span class="flight-details__time-block-time">
                    {{ get('flight.estimated_departure') | time }}
                  </span>
                </div>
                <span v-if="available('flight.esimated_departure')" :class="departureDelayClasses">
                  <i class="fa fa-clock-o"/> {{ departureDelayString }}
                </span>
              </div>
              <div
                :style="logStyles"
                class="flight-details__time-block">
                <span class="flight-details__time-block-title">OFF (UTC)</span>
                <div class="flight-details__time-block-data">
                  <span v-if="available('flight.flightlog.actual_datetime_off')"
                        class="flight-details__time-block-date">
                    {{ get('flight.flightlog.actual_datetime_off') | date }}
                    <span class="flight-details__time-block-year">
                      {{ get('flight.flightlog.actual_datetime_off') | year }}
                    </span>
                  </span>
                  <span class="flight-details__time-block-time">
                    {{ get('flight.flightlog.actual_datetime_off') | time }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="flight-details__info-section-half-width">
            <div class="flight-details__airport-row">
              <div class="flight-details__airport">
                <span class="flight-details__airport-title">Arrival</span>
                <span class="flight-details__airport-value" v-if="flight.actual_destination">
                  {{ flight.actual_destination.iata }}
                </span>
                <span class="flight-details__airport-value" v-else>
                  {{ flight.destination.iata || flight.destination }}
                </span>
              </div>
              <div class="flight-details__airport flight-details__airport_right-aligned flight-details__airport_faded">
                <span class="flight-details__airport-title">Scheduled Arrival</span>
                <span class="flight-details__airport-value">
                  {{ flight.destination.iata || flight.destination }}
                </span>
              </div>
            </div>
            <div class="flight-details__time_row">
              <div
                :style="logStyles"
                class="flight-details__time-block">
                <span class="flight-details__time-block-title">ON (UTC)</span>
                <div class="flight-details__time-block-data">
                  <span v-if="available('flight.flightlog.actual_datetime_on')"
                        class="flight-details__time-block-date">
                    {{ get('flight.flightlog.actual_datetime_on') | date }}
                    <span class="flight-details__time-block-year">
                      {{ get('flight.flightlog.actual_datetime_on') | year }}
                    </span>
                  </span>
                  <span class="flight-details__time-block-time">
                    {{ get('flight.flightlog.actual_datetime_on') | time }}
                  </span>
                </div>
              </div>
              <div
                :style="logStyles"
                v-if="available('flight.flightlog.actual_datetime_in') || !esimatesAvalabile"
                class="flight-details__time-block">
                <span class="flight-details__time-block-title">IN (UTC)</span>
                <div class="flight-details__time-block-data">
                  <span v-if="available('flight.flightlog.actual_datetime_in')"
                        class="flight-details__time-block-date">
                    {{ get('flight.flightlog.actual_datetime_in') | date }}
                    <span class="flight-details__time-block-year">
                      {{ get('flight.flightlog.actual_datetime_in') | year }}
                    </span>
                  </span>
                  <span class="flight-details__time-block-time">
                    {{ get('flight.flightlog.actual_datetime_in') | time }}
                  </span>
                </div>
                <span v-if="available('flight.flightlog.actual_datetime_in')" :class="arrivalDelayClasses">
                  <i class="fa fa-clock-o"/> {{ arrivalDelayString }}
                </span>
              </div>
              <div :style="logStyles" v-else-if="esimatesAvalabile" class="flight-details__time-block">
                <span class="flight-details__time-block-title">Estimated IN (UTC)</span>
                <div class="flight-details__time-block-data">
                  <span v-if="available('flight.estimated_arrival')"
                        class="flight-details__time-block-date">
                    {{ get('flight.estimated_arrival') | date }}
                    <span class="flight-details__time-block-year">
                      {{ get('flight.estimated_arrival') | year }}
                    </span>
                  </span>
                  <span class="flight-details__time-block-time">
                    {{ get('flight.estimated_arrival') | time }}
                  </span>
                </div>
                <span v-if="available('flight.esimated_departure')" :class="departureDelayClasses">
                  <i class="fa fa-clock-o"/> {{ departureDelayString }}
                </span>
              </div>
              <div class="flight-details__time-block flight-details__time-block_bright">
                <span class="flight-details__time-block-title">Scheduled (UTC)</span>
                <div class="flight-details__time-block-data">
                  <span class="flight-details__time-block-date">
                    {{ flight.scheduled_arrival | date }}
                    <span class="flight-details__time-block-year">{{ flight.scheduled_arrival | year }}</span>
                  </span>
                  <span class="flight-details__time-block-time">{{ flight.scheduled_arrival | time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flight-details__info-section flight-details__info-section_specific">
          <div class="flight-details__info-section-half-width">
            <div class="flight-details__block-times">
              <div class="flight-details__block-time">
                <span class="flight-details__block-time-header">Flight time</span>
                <span class="flight-details__block-time-sched">
                  {{ NA_VALUE }}
                  <span class="flight-details__block-time-desc flight-details__block-time-desc_sched"/>
                </span>
                <span
                  :style="logStyles"
                  class="flight-details__block-time-actual">
                  {{ actualFlightTime }}
                  <span class="flight-details__block-time-desc">actual</span>
                </span>
              </div>
              <div class="flight-details__block-time">
                <span class="flight-details__block-time-header">Block time</span>
                <span class="flight-details__block-time-sched">
                  {{ scheduledBlockTime }}
                  <span class="flight-details__block-time-desc flight-details__block-time-desc_sched"/>
                </span>
                <span
                  :style="logStyles"
                  class="flight-details__block-time-actual">
                  {{ actualBlockTime }}
                  <span class="flight-details__block-time-desc">actual</span>
                </span>
              </div>
              <div class="flight-details__block-time">
                <span class="flight-details__block-time-header">Passengers</span>
                <span class="flight-details__block-time-sched">
                  {{ NA_VALUE }}
                  <span class="flight-details__block-time-desc">planned</span>
                </span>
                <span
                  :style="logStyles"
                  class="flight-details__block-time-actual">
                  {{ get('flight.flightlog.number_of_passengers') }}
                  <span class="flight-details__block-time-desc">actual</span>
                </span>
              </div>
            </div>
          </div>
          <div class="flight-details__info-section-half-width">
            <div class="flight-details__pilots-wrapper">
              <div class="flight-details__pilots">
                <div class="flight-details__pilot">
                  <span class="flight-details__pilot-header">PIC</span>
                  <span class="flight-details__pilot-value">
                    as <strong>{{ scheduledPIC }}</strong>
                  </span>
                  <span
                    :style="logStyles"
                    :class="{
                      'flight-details__pilot-actual': true,
                      'flight-details__pilot-actual_smaller': get('flight.flightlog.manifest.pic_name').length > 20
                    }">{{ get('flight.flightlog.manifest.pic_name') }}</span>
                </div>
                <div class="flight-details__pilot">
                  <span class="flight-details__pilot-header">SIC</span>
                  <span class="flight-details__pilot-value">
                    as <strong>{{ scheduledSIC }}</strong>
                  </span>
                  <span
                    :style="logStyles"
                    :class="{
                      'flight-details__pilot-actual': true,
                      'flight-details__pilot-actual_smaller': get('flight.flightlog.manifest.sic_name').length > 20
                    }">{{ get('flight.flightlog.manifest.sic_name') }}</span>
                </div>
              </div>
              <div class="flight-details__tail">
                <div class="flight-details__tail-number flight-details__tail-number_bright">
                  <span v-if="false"
                        class="flight-details__tail-number-value">{{ NA_VALUE }}</span>
                  <span class="flight-details__tail-number-type">
                    {{ scheduledAircraftType }}
                    <span class="flight-details__tail-number-header">Scheduled</span>
                  </span>

                </div>
                <div
                  :style="logStyles"
                  class="flight-details__tail-number">
                  <span v-if="available('flight.flightlog.manifest.tail_number')"
                        class="flight-details__tail-number-value">
                    {{ get('flight.flightlog.manifest.tail_number') }}
                  </span>
                  <span class="flight-details__tail-number-type">
                    {{ get('flight.flightlog.manifest.aircraft_type') }}
                    <span class="flight-details__tail-number-header">Actual</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            :style="logStyles"
            class="flight-details__info-section-half-width">
            <div class="flight-details__hobbs-wrapper">
              <div class="flight-details__hobbs-like">
                <span class="flight-details__hobbs-like-header">Hobbs</span>
                <span class="flight-details__hobbs-like-value">
                  {{ get('flight.flightlog.initial_hobbs') }}
                  <span class="flight-details__hobbs-like-desc">Initial</span>
                </span>
                <span class="flight-details__hobbs-like-value">
                  {{ get('flight.flightlog.final_hobbs') }}
                  <span class="flight-details__hobbs-like-desc">Final</span>
                </span>
              </div>
              <div class="flight-details__takeoffs-like">
                <div class="flight-details__takeoffs-like-item">
                  <span class="flight-details__hobbs-like-header">Takeoffs</span>
                  <span class="flight-details__hobbs-like-value">
                    {{ get('flight.flightlog.number_of_takeoffs_day') }}
                    <span class="flight-details__hobbs-like-desc">day</span>
                  </span>
                  <span class="flight-details__hobbs-like-value">
                    {{ get('flight.flightlog.number_of_takeoffs_night') }}
                    <span class="flight-details__hobbs-like-desc">night</span>
                  </span>
                </div>
                <div class="flight-details__takeoffs-like-item">
                  <span class="flight-details__hobbs-like-header">Landings</span>
                  <span class="flight-details__hobbs-like-value">
                    {{ get('flight.flightlog.number_of_landings_day') }}
                    <span class="flight-details__hobbs-like-desc">day</span>
                  </span>
                  <span class="flight-details__hobbs-like-value">
                    {{ get('flight.flightlog.number_of_landings_night') }}
                    <span class="flight-details__hobbs-like-desc">night</span>
                  </span>
                </div>
              </div>
              <div class="flight-details__hobbs-like">
                <span class="flight-details__hobbs-like-header">Fuel</span>
                <span :class="{
                  'flight-details__hobbs-like-value': true,
                  'flight-details__hobbs-like-value_invalid': isPropInvalid('fuel_burn'),
                }">
                  <throttled-input
                    class="flight-details__input flight-details__hobbs-like-input"
                    v-model="fuel_burn"
                    v-if="editMode"/>
                  <span v-else>{{ get('flight.flightlog.fuel_burn') }}</span>
                  <span class="flight-details__hobbs-like-desc">burned</span>
                </span>
                <span :class="{
                  'flight-details__hobbs-like-value': true,
                  'flight-details__hobbs-like-value_invalid': isPropInvalid('fuel_add_amount'),
                }">
                  <throttled-input
                    class="flight-details__input flight-details__hobbs-like-input"
                    v-model="fuel_add_amount"
                    v-if="editMode"/>
                  <span v-else>{{ get('flight.flightlog.fuel_add_amount') }}</span>
                  <span class="flight-details__hobbs-like-desc">added</span>
                </span>
              </div>
            </div>
          </div>
          <div class="flight-details__info-section-half-width flight-details__ops-wrapper">
            <div
              :style="logStyles"
              class="flight-details__technical-column">
              <div class="flight-details__technical-item">
                <span class="flight-details__technical-item-header">
                  <span class="hidden-sm-and-down">Inst. time</span>
                  <span class="hidden-md-and-up">Inst. <i class="fa fa-clock-o"/></span>
                </span>
                <span class="flight-details__technical-item-value">
                  {{ get('flight.flightlog.instrument_flight_time') }}
                </span>
              </div>
              <div class="flight-details__technical-item">
                <span class="flight-details__technical-item-header">
                  <span class="hidden-sm-and-down">Eng. runs</span>
                  <span class="hidden-md-and-up">Eng. run.</span>
                </span>
                <span class="flight-details__technical-item-value">{{ get('flight.flightlog.engine_runs') }}</span>
              </div>
            </div>
            <div
              :style="logStyles"
              class="flight-details__technical-column">
              <div class="flight-details__technical-item">
                <span class="flight-details__technical-item-header">
                  <span class="hidden-sm-and-down">Night time</span>
                  <span class="hidden-md-and-up">Night <i class="fa fa-clock-o"/></span>
                </span>
                <span class="flight-details__technical-item-value">
                  {{ get('flight.flightlog.night_flight_time') }}
                </span>
              </div>
              <div class="flight-details__technical-item">
                <span class="flight-details__technical-item-header">
                  <span class="hidden-sm-and-down">Oil added</span>
                  <span class="hidden-md-and-up">Oil add.</span>
                </span>
                <span class="flight-details__technical-item-value">{{ get('flight.flightlog.oil_add_amount') }}</span>
              </div>
            </div>
            <div
              :style="logStyles"
              class="flight-details__technical-column">
              <div class="flight-details__operational-row">
                <span class="flight-details__operational-header">Approach</span>
                <span class="flight-details__operational-value flight-details__operational-value_small">
                  {{ get('flight.flightlog.approach') }}
                </span>
              </div>
              <div
                :style="logStyles"
                class="flight-details__operational-row">
                <span class="flight-details__operational-header">Delay</span>
                <span class="flight-details__operational-value flight-details__operational-value_small">
                  {{ get('flight.flightlog.delay') }}
                </span>
              </div>
            </div>
            <div class="flight-details__operational-column">
              <div class="flight-details__operational-row">
                <span class="flight-details__operational-header">
                  <span class="hidden-sm-and-down">Operating under</span>
                  <span class="hidden-md-and-up">Op. under</span>
                </span>
                <span class="flight-details__operational-value">
                  {{ get('flight.operating_under.operation') }}
                </span>
              </div>
              <div class="flight-details__operational-row">
                <span class="flight-details__operational-header">
                  <span class="hidden-sm-and-down">Operating type</span>
                  <span class="hidden-md-and-up">Op. type</span>
                </span>
                <span class="flight-details__operational-value">{{ get('flight.type_of_operations.name') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flight-details__info-section flight-details__info-section_notes">
          <div class="flight-details__notes">
            <span class="flight-details__notes-title">Notes</span>
            <span class="flight-details__notes-desc">
              <div>
                <span v-if="flight.reason">
                  <strong>Delay reason: </strong>
                  {{ flight.reason }}
                </span>
                <span v-if="flight.official_code_verbose">Official code: {{ flight.official_code_verbose }}</span>
              </div>
              <div>{{ get('flight.flightlog.comments') }}</div>
            </span>
          </div>
        </div>

        <div class="flight-details__validation-errors" v-if="editMode">
          <span v-if="!$v.fuel_burn.required">fuel_add_amount.required</span>
          <span v-if="!$v.fuel_add_amount.required">fuel_add_amount.required</span>
        </div>
      </section>
    </horizontal-scrollable>
    <section class="flight-details__event-list">
      <status-log
        :key="log.id"
        :log="log"
        v-for="log in statusLogs"/>
    </section>
  </div>
</template>

<style lang="scss">
  @import "../../../../scss/bs-variables";

  .flight-details {
    position: fixed;
    top: 25%;
    width: 960px;
    left: calc(50% - 960px / 2);
    height: 75%;
    background: #fff;
    color: #737373;
    font-size: 14px;
    overflow-y: auto;
    padding-bottom: 50px;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.5);
    border-radius: 7px 7px 0 0;
    -webkit-overflow-scrolling: touch;
    @media (max-width: 959px) {
      width: 100vw;
      left: 0;
      border-radius: 0;
    }
    &__input {
      border-radius: 3px;
      border: solid 1px #dcdfe6;
    }
    &__header {
      min-height: 57px;
      border-bottom: solid 1px #f4f4f4;
      padding: 0 10px;
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 200;
      @media (max-width: 666px) {
        flex-flow: row wrap;
        padding: 10px;
      }
    }
    &__flight-desc {
      margin: 0 20px 0 0;
      font-size: 24px;
      font-weight: normal;
      @media (max-width: 666px) {
        font-size: 24px;
      }
    }
    &__badges {
      @media (max-width: 666px) {
        flex: 1 1 100%;
        margin-top: 10px;
        display: flex;
        order: 2;
      }
    }
    &__badge {
      border: 1px solid;
      padding: 3px 10px;
      border-radius: 3px;
      margin-right: 10px;
      font-weight: bold;
      &_green {
        border-color: #D5EDCA;
        background: #F0F8EC;
        color: #67C23A;
      }
      &_gray {
        border-color: #eaeaea;
        background: #f7f7f7;
        color: #c3c3c3;
      }
      &_red {
        border-color: #FCD7D5;
        background: #FFF1F0;
        color: #F56C6C;
      }
    }
    &__mode-switch {
      margin-left: auto;
    }
    &__mode-switcher {
      margin: 0 5px;
    }
    &__close {
      height: 30px;
      width: 30px;
      font-size: 20px;
      font-weight: bold;
      color: #7f8584;
      line-height: 30px;
      text-align: center;
      cursor: pointer;
      /*margin-left: 10px;*/
      margin-left: auto;
    }
    &__info {
      margin: 10px 0 25px;
      display: flex;
      flex-flow: row wrap;
      min-width: 768px;
      &-section {
        display: flex;
        justify-content: space-between;
        flex: 1 1 100%;
        &-half-width {
          flex: 0 0 50%;
        }
        &_specific {
          flex-flow: row wrap;
        }
      }

    }
    &__airport-row {
      display: flex;
      padding: 0 10px;
    }
    &__airport {
      display: flex;
      flex-flow: column;
      flex: 1 1 100%;
      &:last-child {
        text-align: right;
      }
      &_faded {
        opacity: .5;
      }
      &-title {
        font-size: 14px;
      }
      &-value {
        line-height: 24px;
        font-size: 24px;
        font-weight: bold;
      }
    }
    &__time_row {
      display: flex;
      justify-content: space-between;
    }
    &__time-block {
      flex: 0 0 33.33%;
      padding: 13px 0;
      &_bright {
        .flight-details__time-block-data {
          background-color: #eff6f6;
        }
      }
      &-title {
        padding-left: 10px;
      }
      &-data {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 12px;
        background-color: #fafafa;
        @media (max-width: 959px) {
          padding: 10px;
        }
      }
      &-date {
        margin-right: 10px;
        display: flex;
        flex-flow: column;
        font-size: 16px;
        font-weight: bold;
        line-height: 1;
        @media (max-width: 959px) {
          font-size: 14px;
        }
      }
      &-year {
        font-size: 13px;
        font-weight: bold;
        color: #b1aeae;
      }
      &-time {
        font-size: 24px;
        font-weight: bold;
        @media (max-width: 959px) {
          font-size: 22px;
        }
      }
      &-delay {
        flex: 1 1 100%;
        justify-content: flex-end;
        display: flex;
        align-items: center;
        font-size: 13px;
        &_positive {
          color: rgba(116, 192, 78, 0.53);
        }
        &_negative {
          color: #F56C6C;
        }
        .fa {
          margin-right: 5px;
        }
      }
    }

    &__block-times {
      display: flex;
      padding-right: 10px;
    }
    &__block-time {
      display: flex;
      flex-flow: column;
      flex: 1 1 33.33%;
      &-header {
        font-size: 14px;
        font-weight: 500;
        padding-left: 10px;
      }
      &-sched, &-actual {
        font-size: 24px;
        font-weight: bold;
        padding: 5px 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        @media (max-width: 959px) {
          font-size: 22px;
        }
      }
      &-sched {
        background-color: #eff6f6;
      }
      &-desc {
        font-size: 14px;
        font-weight: normal;
        overflow: hidden;
        text-overflow: ellipsis;
        &_sched {
          &:before {
            content: 'scheduled';
            @media (max-width: 959px) {
              content: 'sched.';
            }
          }
        }
      }
    }

    &__hobbs-wrapper {
      display: flex;
      margin-top: 10px;
    }
    &__hobbs-like {
      flex-flow: column;
      flex: 1 1 33.33%;
      color: #b1b1b1;
      display: flex;
      padding: 0 10px;
      &-header {

      }
      &-value {
        font-size: 24px;
        font-weight: normal;
        color: #737373;
        @media (max-width: 959px) {
          font-size: 22px;
          white-space: nowrap;
        }
        &_invalid {
          background: red;
        }
      }
      &-input {
        width: 46px;
      }
      &-desc {
        font-size: 14px;
        color: #b1b1b1;
      }
    }
    &__takeoffs-like {
      display: flex;
      color: #b1b1b1;
      flex: 1 1 33.33%;
      background-color: #fafafa;
      padding: 0 10px;
      justify-content: space-between;
      &-item {
        display: flex;
        flex-flow: column;
      }
    }

    &__operational-and-technical {
      flex: 1 1;
      display: flex;
      flex-flow: row wrap;
    }

    &__pilots-wrapper {
      display: flex;
      justify-content: space-between;
    }
    &__pilots {
      flex: 1 1;
      display: flex;
      flex-flow: column;
      padding-left: 10px;
    }
    &__pilot {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      height: 55px;
      &-header {
        font-size: 13px;
        margin-right: 10px;
      }
      &-value {
        font-size: 13px;
        border-radius: 3px;
        background-color: #eff6f6;
        padding: 0 8px;
        color: #b1aeae;
        &:before {
          content: 'scheduled ';
          @media (max-width: 959px) {
            content: 'sch. ';
          }
        }
      }
      &-actual {
        flex: 1 1 100%;
        font-size: 24px;
        font-weight: bold;
        @media (max-width: 959px) {
          font-size: 22px;
        }
        &_smaller {
          @media (max-width: 959px) {
            font-size: 20px;
          }
        }
      }
    }
    &__tail {
      flex: 0 0;
    }
    &__tail-number {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      padding: 0 10px;
      height: 55px;
      &_bright {
        background-color: #eff6f6;
      }
      &-value {
        line-height: 24px;
        font-size: 24px;
        font-weight: bold;
        flex: 1 1 100%;
        @media (max-width: 959px) {
          font-size: 22px;
        }
      }
      &-type {
        font-size: 14px;
        font-weight: 500;
        color: rgba(115, 115, 115, 0.59);
        margin-right: 5px;
        white-space: nowrap;
      }
      &-header {
        font-size: 13px;
        color: rgba(115, 115, 115, 0.25);
      }
    }

    &__ops-wrapper {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      padding-left: 10px;
    }

    &__technical-column, &__operational-column {
      display: flex;
      flex-flow: column;
    }

    &__operational-column {
      background-color: #fafafa;
      padding: 0 10px;
    }

    &__technical-item, &__operational-row {
      display: flex;
      flex-flow: column;
      color: #b1b1b1;
      height: 50px;
      &-value {
        font-size: 22px;
        color: #737373;
      }
    }

    &__operational-value {
      font-size: 22px;
      line-height: 28px;
      color: #737373;
      font-weight: bold;
      @media (max-width: 959px) {
        font-size: 18px;
      }
      &_small {
        font-size: 20px;
        line-height: 31px;
        @media (max-width: 959px) {
          font-size: 16px;
        }
      }
    }

    &__notes {
      margin-top: 10px;
      padding-left: 10px;
      color: #b1b1b1;
      display: flex;
      flex-flow: column;
      &-title {

      }
      &-title {

      }
    }

    &__validation-errors {
      color: red;
    }

    &__event-list {
      padding: 10px 45px;
    }
    &__event-display-older {
      color: #2a82f7;
      margin-left: 100px;
      cursor: pointer;
    }

    .flight-status-log {
      &__event {
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        @media (max-width: $screen-xs-max) {
          flex-flow: row wrap;
        }
      }
      &__event-datetime {
        display: flex;
        flex-flow: column;
        align-items: flex-end;
      }
      &__event-date {

      }
      &__event-time {
        line-height: 18px;
        font-size: 18px;
        font-weight: 500;
      }
      &__event-message {
        margin: 0 20px;
        flex: 1 1;
        background-color: #fafafa;
        border-radius: 3px;
        padding: 6px 10px;
        @media (max-width: $screen-xs-max) {
          margin: 10px 0;
          flex: 1 1 100%;
        }
      }
      &__event-controls {
        @media (max-width: $screen-xs-max) {
          order: -2;
        }
      }
    }
  }
</style>

