<script>
  import {mapActions, mapGetters, mapState, mapMutations} from 'vuex';
  import {DateTime} from 'luxon';
  import {required} from 'vuelidate/lib/validators';
  import {
    mapFormIntField,
    mapFormDateField,
  } from 'store/helpers/forms';

  import Block from 'Common/Block.vue';
  import Errors from 'Common/Form/Errors.vue';
  import VerticalForm from 'Common/Form/VerticalForm.vue';
  import Group from 'Common/Form/Group.vue';
  import GroupSplit from 'Common/Form/GroupSplit.vue';
  import {FlightBtn, FlightList} from 'Common/FlightPicker';
  import {UPDATE_REQUEST, SET_PICKED_FLIGHTS, RESET_REQUEST} from 'store/modules/scheduling/open-time';
  import FlightDetails from '../../../Flight/Status/FlightDetails.vue';
  import DatetimePicker from 'components/fields/Datetimepicker.vue';

  export default {
    props: {
      id: Number,
    },
    computed: {
      ...mapFormIntField('scheduling/openTime/request', `scheduling/openTime/${UPDATE_REQUEST}`, [
        'position', 'base_airport', 'priority',
      ]),
      ...mapFormDateField('scheduling/openTime/request', `scheduling/openTime/${UPDATE_REQUEST}`, [
        'duty_start', 'duty_end',
      ]),
      ...mapGetters('airports', ['pilotBases', 'airports', 'airportByBaseId']),
      ...mapGetters('scheduling/openTime', ['pilots', 'request', 'lastFlight', 'firstFlight']),
      ...mapState('scheduling/openTime', ['flights']),
      pilotsValue: {
        get() {
          return this.request.pilots;
        },
        set(value) {
          this[UPDATE_REQUEST]({pilots: value});
        },
      },
      pickedFlights: {
        get() {
          return this.flights;
        },
        set(flights) {
          this[SET_PICKED_FLIGHTS](flights);
        },
      },
      airportId() {
        return this.base_airport;
      },
      departureDateTime() {
        if (this.flights.length) {
          return this.lastFlight.scheduled_arrival;
        }

        return DateTime.utc().toISO();
      },
    },
    methods: {
      ...mapActions('airports', ['getAllAvailableAirports']),
      ...mapActions('scheduling/openTime', ['getPilotOptions', 'updateOpenTime', 'getOpenTime']),
      ...mapMutations('scheduling/openTime', [UPDATE_REQUEST, SET_PICKED_FLIGHTS, RESET_REQUEST]),
      async handleSubmit() {
        this.$v.$touch();
        if (!this.$v.$invalid) {
          await this.updateOpenTime();
          this.$router.push({name: 'open_time_get', params: {id: this.request.id}});
        }
      },
    },
    components: {
      Block,
      Group,
      GroupSplit,
      Errors,
      VerticalForm,
      FlightBtn,
      FlightList,
      FlightDetails,
      DatetimePicker,
    },
    fieldErrors: {
      dutyStartToFirstFlight: () => 'Duty On must be less than first selected flight\'s departure',
      dutyEndToLastFlight: () => 'Duty Off can\'t be less than last selected flight\'s arrival',
    },
    validations: {
      position: {required},
      base_airport: {required},
      pilotsValue: {required},
      priority: {required},
      duty_start: {
        required,
        dutyStartToFirstFlight(value) {
          if (!this.flights.length) return true;
          return DateTime.fromISO(value) <= DateTime.fromISO(this.firstFlight.scheduled_departure);
        },
      },
      duty_end: {
        required,
        dutyEndToLastFlight(value) {
          if (!this.flights.length) return true;
          return DateTime.fromISO(value) >= DateTime.fromISO(this.lastFlight.scheduled_arrival);
        },
      },
      flights: {required},
    },
    created() {
      this[RESET_REQUEST]();

      if (!this.airports.length) {
        this.getAllAvailableAirports();
      }

      this.getPilotOptions();
      if (this.id) {
        this.getOpenTime(this.id);
      }
    },
    watch: {
      id() {
        if (this.id) {
          this.getOpenTime(this.id);
        }
      },
    },
  };
</script>

<template>
  <div>
    <block :no-padding="true">
      <div slot="title">
        <span>Open time request #{{ id }}</span>
      </div>
      <portal to="header">
        <router-link :to="{ name: 'open_time_list' }">
          <el-button type="primary"
                     icon="el-icon-tickets"
                     size="small"
                     round>
            List all requests
          </el-button>
        </router-link>
      </portal>
      <vertical-form>
        <group-split highlight="true">
          <group label="Position" :validation-data="$v.position">
            <el-radio-group v-model="position" size="small">
              <el-radio-button label="0">PIC</el-radio-button>
              <el-radio-button label="1">SIC</el-radio-button>
            </el-radio-group>
          </group>
          <group label="Base" :validation-data="$v.base_airport">
            <el-select v-model="base_airport" filterable placeholder="Select">
              <el-option
                v-for="base in pilotBases"
                :key="base.id"
                :label="base.iata"
                :value="base.id"/>
            </el-select>
          </group>
          <group label="Priority" :validation-data="$v.priority">
            <el-radio-group v-model="priority" size="small">
              <el-radio-button :label="0">Immediate</el-radio-button>
              <el-radio-button :label="1">Urgent</el-radio-button>
              <el-radio-button :label="2">Medium</el-radio-button>
              <el-radio-button :label="3">Low</el-radio-button>
            </el-radio-group>
          </group>
        </group-split>
        <group-split>
          <group label="Pilots" class="open-time__pilots" :validation-data="$v.pilotsValue">
            <el-select v-model="pilotsValue" placeholder="Select" filterable multiple>
              <el-option
                v-for="pilot in pilots"
                :key="pilot.id"
                :label="pilot.name"
                :value="pilot.id">
                <span>{{ pilot.name }}
                  <el-tag v-if="pilot.is_pic" type="info" size="mini">PIC</el-tag>
                  <el-tag v-else type="info" size="mini">SIC</el-tag>
                  <el-tag size="mini">{{ pilot.base_name }}</el-tag>
                </span>
              </el-option>
            </el-select>
          </group>
        </group-split>
        <group-split>
          <group label="Duty start" :validation-data="$v.duty_start">
            <datetime-picker v-model="duty_start"/>
          </group>
          <group label="Duty end" :validation-data="$v.duty_end">
            <datetime-picker v-model="duty_end"/>
          </group>
        </group-split>
        <group label="Flights" :validation-data="$v.flights">
          <template slot="title">
            <flight-btn
              slot="title"
              class="open-time__add-flight-btn"
              :flight-filters="{
                origin: airportId ? [airportId] : undefined,
                scheduled_departure: departureDateTime ? [departureDateTime] : undefined,
              }"
              :show-flights="false"
              :modal-options="{
                multiple: true,
              }"
              v-model="pickedFlights"/>
          </template>

          <flight-list
            class="open-time__flight-list"
            v-if="pickedFlights.length"
            :flights="pickedFlights"/>
        </group>
        <group>
          <el-button type="success" @click="handleSubmit">Submit</el-button>
        </group>
      </vertical-form>
    </block>

    <flight-details :z-index="2100"/>
  </div>
</template>

<style scoped lang="scss">
  .open-time {
    &__pilots {
      .el-select {
        width: 100%;
      }
    }
    &__add-flight-btn {
      margin-left: 10px;
    }
    &__flight-list {
      margin-top: 10px;
    }
  }

  .el-select-dropdown__item span.el-tag {
    line-height: 18px !important

  }
</style>
