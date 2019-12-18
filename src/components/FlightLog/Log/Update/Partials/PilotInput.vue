<script>
  import range from 'lodash/range';
  import forEach from 'lodash/forEach';
  import find from 'lodash/find';
  import SunCalc from 'suncalc';
  import {DateTime, Duration} from 'luxon';
  import {mapGetters, mapActions} from 'vuex';
  import {required} from 'vuelidate/lib/validators';
  import updateMixin, {logProperty, toNumber, toFloat} from '../updateMixin';
  import {Row, Col, Select, Option} from 'element-ui';
  import RadioGroup from 'element-ui/lib/radio-group';
  import RadioButton from 'element-ui/lib/radio-button';

  import GlobalError from "Common/Form/GlobalError.vue";
  import Collapse from '../../../../Common/Collapse.vue';
  import Group from "Common/Form/Group.vue";
  import NumberField from "Common/Form/Fields/NumberField.vue";
  import TextField from "Common/Form/Fields/TextField.vue";
  import TextAreaField from "Common/Form/Fields/TextAreaField.vue";
  import Selectize from '../../../../fields/Selectize.vue';
  import DatetimeInput from "../../../../fields/DatetimeInput.vue";
  import {toRepr} from '../../../../../utils/date';

  const DELAY_ID_IS_OTHER = 10;

  export default {
    data() {
      return {
        oilAmounts: range(0, 5.25, 0.25),
        engineVals: [1, 0],
        outUpdateTrigger: null,
        inUpdateTrigger: null,
        overlappedLogs: [],
      }
    },
    mixins: [updateMixin],
    components: {
      ElRow: Row,
      ElCol: Col,
      ElSelect: Select,
      ElOption: Option,
      RadioGroup,
      RadioButton,
      Collapse,
      Group,
      NumberField,
      TextField,
      TextAreaField,
      Selectize,
      DatetimeInput,
      GlobalError
    },
    computed: {
      ...mapGetters(
        'pilotManifest',
        [
          'delays',
          'approaches',
          'manifest',
        ]
      ),
      ...mapGetters('flightlog', [
        'calcNightTimeFlag',
        'isAirReturn',
        'isGateReturn'
      ]),
      ...mapGetters(
        'offline',
        ['onlineStatus']
      ),
      ...mapGetters(
        'wb',
        ['availableAircraftTypes']
      ),
      ...mapGetters('manifest/logs', [
        'logs',
        'OOOIOverlappedLogs',
      ]),
      isFlightLogOpen() {
        return this.flightlog.open;
      },
      disableNightTimeRelated() {
        return !this.onlineStatus;
      },
      aircraftType() {
        return find(
          this.availableAircraftTypes,
          (at) => at.name == this.manifest.aircraft_type
        );
      },
      fuelBurnMax() {
        return this.aircraftType.fuel_burn_max;
      },
      fuelAddMax() {
        return this.aircraftType.mfobm_max;
      },
      showOverlapLogsAlert() {
        return (this.$v.actual_datetime_out.$error || this.$v.actual_datetime_in.$error) && this.overlappedLogs.length;
      },
      id: logProperty('id', toNumber),
      number_of_passengers: logProperty('number_of_passengers', toNumber),
      flying_pilot: logProperty('flying_pilot'),
      actual_datetime_out: logProperty('actual_datetime_out'),
      actual_datetime_off: logProperty('actual_datetime_off'),
      actual_datetime_on: logProperty('actual_datetime_on'),
      actual_datetime_in: logProperty('actual_datetime_in'),
      night_flight_time: logProperty('night_flight_time', toFloat),
      instrument_flight_time: logProperty('instrument_flight_time', toFloat),
      initial_hobbs: logProperty('initial_hobbs', toFloat),
      final_hobbs: logProperty('final_hobbs', toFloat),
      fuel_burn: logProperty('fuel_burn', toNumber),
      fuel_add_amount: logProperty('fuel_add_amount', toNumber),
      oil_add_amount: logProperty('oil_add_amount'),
      number_of_takeoffs_day: logProperty('number_of_takeoffs_day', toNumber),
      number_of_takeoffs_night: logProperty('number_of_takeoffs_night', toNumber),
      number_of_landings_day: logProperty('number_of_landings_day', toNumber),
      number_of_landings_night: logProperty('number_of_landings_night', toNumber),
      engine_runs: logProperty('engine_runs', toNumber),
      approach_id: logProperty('approach_id', toNumber),
      delay_id: logProperty('delay_id', toNumber),
      comments: logProperty('comments'),
      flight_time() {
        if (this.isGateReturn) {
          return 0;
        }
        const onTime = DateTime.fromISO(this.actual_datetime_on, { setZone: true });
        const offTime = DateTime.fromISO(this.actual_datetime_off, { setZone: true });
        const diff = onTime.diff(offTime);
        return Math.round(diff.as('hours') * 10) / 10;
      },
      block_time() {
        const inTime = DateTime.fromISO(this.actual_datetime_in, { setZone: true });
        const outTime = DateTime.fromISO(this.actual_datetime_out, { setZone: true });
        const diff = inTime.diff(outTime);
        return Math.round(diff.as('hours') * 10) / 10;
      },
      engineStartsDisabled() {
        return this.flightlog.flight.type_of_operations !== 'Training';
      },
      allowed_diff() {
        return this.flightlog.flight.type_of_operations == 'Training' ? 0.8 : 0.2;
      },
    },
    fieldErrors: {
      actual_datetime_out_overlap_validation: (vm) => {
        return 'Block time overlaps different log';
      },
      actual_datetime_off_validation: (vm) => {
        return "Actual datetime off should be equal or greater than Actual datetime out!"
      },
      actual_datetime_on_validation: (vm) => {
        return "Actual datetime on should be equal or greater than Actual datetime off!"
      },
      actual_datetime_in_validation: (vm) => {
        return "Actual datetime in should be equal or greater than Actual datetime on!"
      },
      actual_datetime_in_overlap_validation: (vm) => {
        return 'Block time overlaps different log';
      },
      flight_time_validation: (vm) => {
        return "Flight time can't be more than 8 hours.";
      },
      flight_time_more_than_zero: (vm) => {
        return "Flight time shouldn't be negative";
      },
      final_hobbs_validation: (vm) => {
        return "It should be greater than initial hobbs";
      },
      final_hobbs_diff_validation: (vm) => {
        return `Difference between Flight time and Hobbs hours should be less than or equal to ${vm.allowed_diff}!`
      },
      delay_validation: (vm) => {
        return "Specify delay reason";
      },
      instrument_flight_time_validation: (vm) => {
        return "Instrument flight time cannot be more than block time"
      },
      globalLadingsTakesoffMatch: (vm) => {
        return " Total number of landings and total number of take offs are different"
      },
      number_of_passengers_validation: vm => "Number of passengers should be validated less or equal to 9",
      number_of_passengers_validation1: vm => "Number of passengers shouldn't be negative",
      night_flight_time_validation: vm => "Night flight time shouldn't be greater than block time",
      fuel_burn_validation: vm => `Fuel Burned should be greater than 0 and less than ${vm.fuelBurnMax}`,
      fuel_add_amount_validation: vm => `Fuel Add Amount could not be greater than ${vm.fuelAddMax}`,
      comments_validation: vm => 'For delays categorized as "Others", you are required ' +
        'to provide more context regarding this delay in the comments section below.',
    },
    // globalErrors: ['globalLadingsTakesoffMatch'],
    validations() {
      const validations = {
        comments: {
          comments_validation(value) {
            if (this.delay_id !== DELAY_ID_IS_OTHER) {
              return true;
            }
            return value !== '';
          },
        },
        number_of_passengers: {
          required,
          number_of_passengers_validation(value) {
            return value <= 9;
          },
          number_of_passengers_validation1(value) {
            return value >= 0;
          }
        },
        flying_pilot: {required},
        actual_datetime_out: {
          required,
          actual_datetime_out_overlap_validation() {
            return !this.overlappedLogs.length;
          },
        },
        actual_datetime_in: {
          required,
          actual_datetime_in_validation(value) {
            return value >= this.actual_datetime_on;
          },
          actual_datetime_in_overlap_validation() {
            return !this.overlappedLogs.length;
          },
        },
        initial_hobbs: {required},
        fuel_burn: {
          required,
        },
        fuel_add_amount: {
          required,
          fuel_add_amount_validation(value) {
            return value < this.fuelAddMax;
          }
        },
        oil_add_amount: {required},
        delay_id: {
          delay_validation(value) {
            if (['Training', 'Maintenance', 'Reposition']
                .indexOf(this.flightlog.flight.type_of_operations) > -1) {
              return true;
            }
            const actual = DateTime.fromISO(this.actual_datetime_in, { setZone: true });
            const scheduled = DateTime.fromISO(this.flightlog.flight.scheduled_arrival, { setZone: true });
            return actual.diff(scheduled, 'minutes').as('minutes') < 15 || value;
          },
        },
      };
      const regularValidation = {
        actual_datetime_off: {
          required,
          actual_datetime_off_validation(value) {
            return value >= this.actual_datetime_out;
          }
        },
        actual_datetime_on: {
          required,
          actual_datetime_on_validation(value) {
            return value >= this.actual_datetime_off;
          }
        },
        flight_time: {
          required,
          flight_time_validation(value) {
            return value < 8.0;
          },
          flight_time_more_than_zero(value) {
            return value > 0;
          }
        },
        number_of_takeoffs_day: {
          required,
          globalLadingsTakesoffMatch(val) {
            return val + this.number_of_takeoffs_night == this.number_of_landings_day + this.number_of_landings_night
          }
        },
        number_of_takeoffs_night: {
          required,
          globalLadingsTakesoffMatch(val) {
            return val + this.number_of_takeoffs_day == this.number_of_landings_day + this.number_of_landings_night
          }
        },
        number_of_landings_day: {
          required,
          globalLadingsTakesoffMatch(val) {
            return this.number_of_takeoffs_night + this.number_of_takeoffs_day == val + this.number_of_landings_night
          }
        },
        number_of_landings_night: {
          required,
          globalLadingsTakesoffMatch(val) {
            return this.number_of_takeoffs_night + this.number_of_takeoffs_day == val + this.number_of_landings_day
          }
        },
        night_flight_time: {
          required,
          night_flight_time_validation(value) {
            return value <= this.block_time;
          }
        },
        instrument_flight_time: {
          required,
          instrument_flight_time_validation(value) {
            return value <= this.block_time;
          }
        },
        fuel_burn: {
          required,
          fuel_burn_validation(value) {
            return 0 < value && value < this.fuelBurnMax;
          }
        },
        approach_id: {required},
        final_hobbs: {
          required,
          final_hobbs_validation(value) {
            return this.initial_hobbs < value;
          },
          final_hobbs_diff_validation(value) {
            return Math.abs(value - this.initial_hobbs - this.flight_time) < (this.allowed_diff + 0.01);
          },
        },
      };
      if (this.isGateReturn) {
        return validations;
      } else {
        return {...validations, ...regularValidation};
      }
    },
    methods: {
      recalcNightTimes() {
        const {origin_location, destination_location} = this.flightlog.flight;
        let {
          actual_datetime_off,
          actual_datetime_on,
          actual_datetime_out,
          actual_datetime_in
        } = this.flightlog;

        if (actual_datetime_off) {
          actual_datetime_off = DateTime.fromISO(actual_datetime_off, {zone: 'utc'});
          [
            this.number_of_takeoffs_night,
            this.number_of_takeoffs_day
          ] = this.getNightOrDay(actual_datetime_off, origin_location);
        }

        if (actual_datetime_on) {
          actual_datetime_on = DateTime.fromISO(actual_datetime_on, {zone: 'utc'});
          [
            this.number_of_landings_night,
            this.number_of_landings_day
          ] = this.getNightOrDay(actual_datetime_on, destination_location);
        }

        if (actual_datetime_out && actual_datetime_in) {
          const dt_out = DateTime.fromISO(actual_datetime_out, {zone: 'utc'});
          const dt_in = DateTime.fromISO(actual_datetime_in, {zone: 'utc'});

          const takeoff_infos = this.getSunRiseSetInfo(dt_out, origin_location);
          const landing_on_date_infos = this.getSunRiseSetInfo(dt_in, destination_location);

          const tb = DateTime.fromJSDate(landing_on_date_infos[0]['dawn'], {zone: 'utc'});
          const te = DateTime.fromJSDate(landing_on_date_infos[0]['dusk'], {zone: 'utc'});

          if (tb <= dt_out && dt_in <= te) {
            this.night_flight_time = 0
          } else {
            let night_time_spans = []
            const cond = (dt_out <= tb && tb <= te && te <= dt_in);
            if ((tb <= dt_out && dt_out <= te) || dt_out >= te || cond) {
              const end = DateTime.fromJSDate(landing_on_date_infos[0]['dusk'], {zone: 'utc'});
              const begin = DateTime.fromJSDate(landing_on_date_infos[1]['dawn'], {zone: 'utc'});
              night_time_spans.push([end, begin]);
            } else if ((tb <= dt_in && dt_in <= te) || dt_in <= tb || cond) {
              night_time_spans.push(
                [
                  DateTime.fromJSDate(
                    landing_on_date_infos[2]['dusk'],
                    {zone: 'utc'}
                  ),
                  DateTime.fromJSDate(
                    landing_on_date_infos[0]['dawn'],
                    {zone: 'utc'}
                  )
                ]
              );
            }

            let night_time = 0.0;
            forEach(night_time_spans, ([st, et]) => {
              const c_off = st >= dt_out ? st : dt_out;
              const c_on = et <= dt_in ? et : dt_in;
              const cond = (st <= c_off && c_off && et && dt_out <= c_off && c_off <= dt_in &&
                st <= c_on && c_on <= et && dt_out <= c_on && c_on <= dt_in);
              if (cond) {
                night_time += (Math.abs(c_on.diff(c_off, 'hours').toObject()['hours']))
              }
            });
            this.night_flight_time = Math.round(night_time * 10) / 10;
          }
        }

      },
      getSunRiseSetInfo(dt, loc) {
        return [
          SunCalc.getTimes(dt.toJSDate(), loc[0], loc[1]),
          SunCalc.getTimes(dt.plus({days: 1}).toJSDate(), loc[0], loc[1]),
          SunCalc.getTimes(dt.plus({days: -1}).toJSDate(), loc[0], loc[1]),
        ];
      },
      getNightOrDay(dt, location) {
        const infos = this.getSunRiseSetInfo(dt, location);
        for (let i = 0; i < infos.length; i++) {
          const sunrise = DateTime.fromJSDate(infos[i]['sunrise'], {zone: 'utc'});
          const sunset = DateTime.fromJSDate(infos[i]['sunset'], {zone: 'utc'});
          if (dt > sunrise.plus({hours: -1}) && dt < sunset.plus({hours: 1})) {
            return [0, 1]
          }
        }

        return [1, 0];
      },
      toISODate(date) {
        return DateTime.fromJSDate(date, { zone: 'utc' }).toISO({ suppressMilliseconds: true });
      },
      fillActualDatetimeOut() {
        this.actual_datetime_out = this.toISODate(new Date());
        this.outUpdateTrigger = +new Date();
      },
      fillActualDatetimeIn() {
        this.actual_datetime_in = this.toISODate(new Date());
        this.inUpdateTrigger = +new Date();
      },
      refreshOverlappedLogs() {
        console.log(this.actual_datetime_out, this.actual_datetime_in)
        this.overlappedLogs = this.OOOIOverlappedLogs(this.id, [this.actual_datetime_out, this.actual_datetime_in]);
      },
    },
    watch: {
      calcNightTimeFlag(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.recalcNightTimes();
        }
      },
      actual_datetime_out() {
        this.refreshOverlappedLogs();
      },
      actual_datetime_in() {
        this.refreshOverlappedLogs();
      },
      logs() {
        this.refreshOverlappedLogs();
      },
    },
  };
</script>

<template>
  <div class="pilot-input">
    <collapse title="PILOT INPUT">
      <el-row :gutter="30">
        <el-col :span="12">
          <group label="Number of passengers" :validation-data="$v.number_of_passengers">
            <number-field v-model="number_of_passengers" :max="9" v-if="isFlightLogOpen"/>
            <div v-else>{{flightlog.number_of_passengers}}</div>
          </group>
        </el-col>
        <el-col :span="12">
          <div class="pull-right">
            <group label="Flying Pilot" :validation-data="$v.flying_pilot">
              <el-radio-group v-if="isFlightLogOpen" v-model="flying_pilot">
                <el-radio-button label="PIC"/>
                <el-radio-button label="SIC" :disabled="flightlog.manifest.number_of_pilots == 1"/>
              </el-radio-group>
              <div v-else>{{flightlog.flying_pilot}}</div>
            </group>
          </div>
        </el-col>
      </el-row>

      <hr/>

      <div>
        <el-alert
          class="pilot-input__overlapped-logs-alert"
          title="Error!"
          type="error"
          v-if="showOverlapLogsAlert"
          :closable="false"
          show-icon>
          OOOI times ovelapping with:
          <div class="pilot-input__overlapped-logs">
            <router-link
              :key="log.id"
              v-for="log in overlappedLogs"
              :to="{ name: 'dispatch_log_edit', params: { id: manifest.id, logId: log.id }}"
            >
              <strong>{{ log.flight.flight_number }}</strong>
              {{ log.actual_datetime_out | longDT }} — {{ log.actual_datetime_in | longDT }} (UTC)
              <strong> {{ log.flight.origin }} → {{ log.flight.destination }}</strong>
            </router-link>
          </div>
        </el-alert>

        <el-row v-if="isFlightLogOpen" :gutter="30" class="pilot-input--times">
          <group :validation-data="$v.actual_datetime_out">
            <el-col :xs="24" :sm="8">
              <div class="pilot-input--times__grouped pilot-input--out-header">
                <span class="pilot-input--times__label">
                Actual date/time <strong>OUT</strong>(UTC)
              </span>
              </div>
            </el-col>
            <el-col :xs="24" :sm="16">
              <div class="pilot-input--fill-btn-wrapper">
                <el-button
                  v-if="flightlog.flight.scheduled_departure"
                  v-track:click.fl-fill="{
                    time: 'out',
                    log: flightlog.id,
                    flight: flightlog.flight.id,
                    flight_number: flightlog.flight.flight_number,
                  }"
                  class="pilot-input--fill-btn"
                  @click="fillActualDatetimeOut"
                  size="small"
                  type="primary"><i class="fa fa-arrow-down"></i>OUT (NOW)
                </el-button>
                <span class="pilot-input--fill-desc">Press the OUT button when departing to fill out the date/time
                                                   OUT with the current UTC date/time</span>
              </div>
              <datetime-input
                :key="outUpdateTrigger"
                v-model="actual_datetime_out"/>
            </el-col>
          </group>
        </el-row>
        <el-row v-else :gutter="30" class="pilot-input--times">
          <group :validation-data="$v.actual_datetime_out">
            <el-col :xs="24" :sm="8">
              <span class="pilot-input--times__label">
                Actual date/time <strong>OUT</strong>(UTC)
              </span>
            </el-col>
            <el-col :xs="24" :sm="16">
              <div class="pilot-input--times__data">{{flightlog.actual_datetime_out|longDT}}</div>
            </el-col>
          </group>
        </el-row>
        <el-row v-if="!isGateReturn" :gutter="30" class="pilot-input--times">
          <group :validation-data="$v.actual_datetime_off">
            <el-col :xs="24" :sm="8">
            <span class="pilot-input--times__label">
              Actual date/time <strong>OFF</strong>(UTC)
            </span>
            </el-col>
            <el-col :xs="24" :sm="16">
              <datetime-input v-if="isFlightLogOpen" v-model="actual_datetime_off"/>
              <div v-else class="pilot-input--times__data">{{flightlog.actual_datetime_off|longDT}}</div>
            </el-col>
          </group>
        </el-row>
        <el-row v-if="!isGateReturn" :gutter="30" class="pilot-input--times">
          <group :validation-data="$v.actual_datetime_on">
            <el-col :xs="24" :sm="8">
            <span class="pilot-input--times__label">
              Actual date/time <strong>ON</strong>(UTC)
            </span>
            </el-col>
            <el-col :xs="24" :sm="16">
              <datetime-input v-if="isFlightLogOpen" v-model="actual_datetime_on"/>
              <div v-else class="pilot-input--times__data">{{flightlog.actual_datetime_on|longDT}}</div>
            </el-col>
          </group>
        </el-row>
        <el-row :gutter="30" class="pilot-input--times">
          <group :validation-data="$v.actual_datetime_in">
            <el-col :xs="24" :sm="8">
              <span class="pilot-input--times__label">
                Actual date/time <strong>IN</strong>(UTC)
              </span>
            </el-col>
            <el-col :xs="24" :sm="16">
              <datetime-input v-if="isFlightLogOpen"
                              :key="inUpdateTrigger"
                              v-model="actual_datetime_in"/>
              <div v-else class="pilot-input--times__data">{{flightlog.actual_datetime_in|longDT}}</div>
              <div v-if="isFlightLogOpen" class="pilot-input--fill-btn-wrapper">
                <el-button
                  v-if="flightlog.flight.scheduled_arrival"
                  v-track:click.fl-fill="{
                    time: 'in',
                    log: flightlog.id,
                    flight: flightlog.flight.id,
                    flight_number: flightlog.flight.flight_number,
                  }"
                  class="pilot-input--fill-btn"
                  @click="fillActualDatetimeIn"
                  type="primary"
                  size="small"><i class="fa fa-arrow-up"></i> IN (NOW)
                </el-button>
                <span class="pilot-input--fill-desc">Press the IN button when arriving to fill out the date/time IN
                with the current utc date/time</span>
              </div>
            </el-col>
          </group>
        </el-row>
      </div>

      <hr/>
      <el-row>
        <el-col :xs="12" :sm="8">
          <group :validation-data="$v.flight_time" label="Flight Time">
            <number-field v-if="isFlightLogOpen && !isGateReturn" v-model="flight_time" step="0.1" :min="0"
                          :disabled="true"/>
            <div v-else-if="flight_time !== null">{{flight_time}}</div>
          </group>
        </el-col>
        <el-col :xs="12" :sm="8">
          <group :validation-data="$v.block_time" label="Block Time">
            <number-field v-if="isFlightLogOpen" v-model="block_time" step="0.1" :min="0" :disabled="true"/>
            <div v-else>{{flightlog.block_time}}</div>
          </group>
        </el-col>
        <el-col :xs="24" :sm="8">
          <group :validation-data="$v.night_flight_time" label="Night Flight Time">
            <number-field v-if="isFlightLogOpen" v-model="night_flight_time" step="0.1" :min="0"
                          :disabled="disableNightTimeRelated"/>
            <div v-else>{{flightlog.night_flight_time}}</div>
            <p slot="help" v-if="isFlightLogOpen" class="pilot-input--help">
              This field will be calculated automatically based on Actual date/times changes but you can change it
              manually
            </p>
          </group>
        </el-col>
      </el-row>

      <hr/>

      <el-row>
        <el-col :xs="24" :sm="8">
          <group :validation-data="$v.instrument_flight_time" label="Instrument Flight Time">
            <number-field v-if="isFlightLogOpen" v-model="instrument_flight_time" step="0.1" :min="0"/>
            <div v-else>{{flightlog.instrument_flight_time}}</div>
          </group>
        </el-col>

        <el-col :xs="12" :sm="8">
          <group :validation-data="$v.initial_hobbs" label="Initial HOBBS">
            <number-field v-if="isFlightLogOpen" v-model="initial_hobbs" step="0.1" :min="0"/>
            <div v-else>{{flightlog.initial_hobbs}}</div>
          </group>
        </el-col>

        <el-col :xs="12" :sm="8">
          <group :validation-data="$v.final_hobbs" label="Final HOBBS">
            <number-field v-if="isFlightLogOpen && !isGateReturn" v-model="final_hobbs" step="0.1" :min="0"/>
            <div v-else>{{flightlog.final_hobbs}}</div>
          </group>
        </el-col>
      </el-row>

      <el-row>
        <el-col :xs="12" :sm="6">
          <group :validation-data="$v.fuel_burn" label="Fuel Burned">
            <number-field v-if="isFlightLogOpen" v-model="fuel_burn" step="1" :min="0"/>
            <div v-else>{{flightlog.fuel_burn}}</div>
          </group>
        </el-col>

        <el-col :xs="12" :sm="6">
          <group :validation-data="$v.fuel_add_amount" label="Fuel Add Amount">
            <number-field v-if="isFlightLogOpen" v-model="fuel_add_amount" step="1" :min="0"/>
            <p slot="help" v-if="isFlightLogOpen" class="pilot-input--help">Fuel added (in pounds), input 0 if no fuel
              was added for this flight</p>
            <div v-else>{{flightlog.fuel_add_amount}}</div>
          </group>
        </el-col>

        <el-col :xs="12" :sm="6">
          <group :validation-data="$v.oil_add_amount" label="Oil Add Amount">
            <el-select v-if="isFlightLogOpen" v-model="oil_add_amount" placeholder="Select...">
              <el-option
                v-for="v in oilAmounts"
                :key="v"
                :label="v.toFixed(2)"
                :value="v.toFixed(2)">
              </el-option>
            </el-select>
            <div v-else>{{flightlog.oil_add_amount}}</div>
            <p v-if="isFlightLogOpen" slot="help" class="pilot-input--help">
              Quarts of oil added, choose 0 if no oil was added for this flight</p>
          </group>
        </el-col>

        <el-col :xs="12" :sm="6">
          <group :validation-data="$v.engine_runs" label="Engine Starts">
            <el-select v-if="isFlightLogOpen" v-model="engine_runs" placeholder="Select..."
                       :disabled="engineStartsDisabled">
              <el-option
                v-for="v in engineVals"
                :key="`engine-${v}`"
                :label="v"
                :value="v">
              </el-option>
            </el-select>
            <div v-else>{{flightlog.engine_runs}}</div>
            <p v-if="isFlightLogOpen" slot="help" class="pilot-input--help">
              Choose 1 if you started the engine for that flight log, and 0 if you did not start the engine on that log
            </p>
          </group>
        </el-col>
      </el-row>

      <el-row>
        <el-col :xs="24">
          <global-error :validation-data="$v"></global-error>
        </el-col>
        <el-col :xs="12" :sm="6">
          <group label="Number of takeoffs (day)" :validation-data="$v.number_of_takeoffs_day">
            <number-field v-if="isFlightLogOpen && !isGateReturn" v-model="number_of_takeoffs_day" :min="0" :step="1"/>
            <div v-else>{{flightlog.number_of_takeoffs_day}}</div>
          </group>
        </el-col>

        <el-col :xs="12" :sm="6">
          <group label="Number of takeoffs (night)" :validation-data="$v.number_of_takeoffs_night">
            <number-field v-if="isFlightLogOpen && !isGateReturn" v-model="number_of_takeoffs_night" :min="0"
                          :step="1"/>
            <div v-else>{{flightlog.number_of_takeoffs_night}}</div>
          </group>
        </el-col>

        <el-col :xs="12" :sm="6">
          <group label="Number of landings (day)" :validation-data="$v.number_of_landings_day">
            <number-field v-if="isFlightLogOpen && !isGateReturn" v-model="number_of_landings_day" :min="0" :step="1"/>
            <div v-else>{{flightlog.number_of_landings_day}}</div>
          </group>
        </el-col>

        <el-col :xs="12" :sm="6">
          <group label="Number of landings (night)" :validation-data="$v.number_of_landings_night">
            <number-field v-if="isFlightLogOpen && !isGateReturn" v-model="number_of_landings_night" :min="0"
                          :step="1"/>
            <div v-else>{{flightlog.number_of_landings_night}}</div>
          </group>
        </el-col>
      </el-row>
      <el-row v-if="isFlightLogOpen" :gutter="30">
        <el-col :span="24">
          <p class="pilot-input--help">
            Number of takeoffs and landings are calculated automatically based on Actual date/times changes but you can
            change them manually
          </p>
        </el-col>
      </el-row>

      <hr/>

      <el-row>
        <el-col :xs="12" :sm="8">
          <group :validation-data="$v.delay_id" label="Delay">
            <el-select v-if="isFlightLogOpen" v-model="delay_id" placeholder="None" clearable>
              <el-option
                v-for="d in delays"
                :key="d.id"
                :label="d.name"
                :value="d.id">
              </el-option>
            </el-select>
            <div v-else>{{flightlog.delay == null ? "-": flightlog.delay}}</div>
          </group>
        </el-col>
        <el-col :xs="12" :sm="8">
          <group :validation-data="$v.approach_id" label="Approach" v-if="!isGateReturn">
            <el-select v-if="isFlightLogOpen" v-model="approach_id" placeholder="Select...">
              <el-option
                v-for="a in approaches"
                :key="a.id"
                :label="a.name"
                :value="a.id">
              </el-option>
            </el-select>
            <div v-else>{{flightlog.approach}}</div>
          </group>
        </el-col>
      </el-row>

      <hr/>

      <el-row :gutter="30">
        <el-col :span="24">
          <group :validation-data="$v.comments" label="Comments">
            <text-area-field v-if="isFlightLogOpen" v-model="comments"/>
            <div v-else>{{flightlog.comments}}</div>
          </group>
        </el-col>
      </el-row>
    </collapse>
  </div>
</template>

<style lang="scss">
  @import "../../../../../../scss/bs-variables";

  .pilot-input {
    .el-row {
      padding: 10px 0;
    }

    &--times {
      margin-bottom: 20px;
      &__label {
        float: right;
        line-height: 34px;
      }
      &__data {
        float: left;
        line-height: 34px;
      }
      .btq-form__help-text {
        text-align: right;
        margin-right: 15px;
      }
    }

    &--fill-btn-wrapper {
      margin-bottom: 10px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    &--fill-btn {
      padding: 15px 60px;

      @media screen and (max-width: $screen-sm) {
        padding: 15px 10px;
        flex: 1 0 calc(50% - 10px);
      }
    }

    &--fill-desc {
      font-size: 10px;
      padding-left: 10px;
      color: #676a6c;
      padding-right: 50px;
      @media screen and (max-width: $screen-sm-max) {
        padding-right: 0;
      }
    }

    &--out-header {
      margin-top: 52px;
      @media screen and (max-width: $screen-xs-max) {
        margin-top: 0;
      }
    }

    &--help {
      padding-top: 10px;
      font-size: 11px;
      color: $lazur;
    }

    .el-radio-button__inner {
      @media screen and (max-width: $screen-xs-max) {
        padding: 12px 10px;
      }
    }

    &__overlapped-logs {
      display: flex;
      flex-flow: column;
    }

    &__overlapped-logs-alert {
      position: sticky;
      top: 0;
      z-index: 10;
    }
  }
</style>
