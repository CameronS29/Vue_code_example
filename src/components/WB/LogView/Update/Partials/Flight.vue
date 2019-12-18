<script>
  import { mapGetters, mapActions } from 'vuex';
  import { find } from 'lodash';
  import { requiredIf } from 'vuelidate/lib/validators';
  import * as consts from 'store/modules/wb/consts';

  import { Select, Option } from 'element-ui';
  import PickFlightBtn from '../../../../FlightLog/Log/Common/FlightPicker/Btn.vue';

  import updateLogMixin, {
    logProperty,
    toNumber,
    videcomDependant,
  } from './updateLogMixin';


  export default {
    mixins: [updateLogMixin],

    components: {
      PickFlightBtn,
      ElSelect: Select,
      ElOption: Option,
    },

    computed: {
      ...mapGetters('wb', [
        'availableAirports',
        'availableAircrafts',
        'availableFlights',
        'selectedAircraftType',
        'selectedDeparture',
        'selectedArrival',
        'selectedDate',
        'validate',
      ]),

      ...mapGetters('user', [
        'isDispatcher',
        'isPilot',
      ]),

      flight: videcomDependant(logProperty('flight', toNumber)),
      flight_data: logProperty('flight_data'),
      aircraft: logProperty('aircraft', toNumber),
      WBLogDeparture: logProperty('departure', toNumber),
      WBLogArrival: logProperty('arrival', toNumber),

      departure: {
        get() {
          const airport = find(this.availableAirports, { iata: this.selectedDeparture });
          return airport.id;
        },
        set(value) {
          if (!value) return;

          this.WBLogDeparture = value;
          this.originEditMode = false;
        },
      },
      arrival: {
        get() {
          const airport = find(this.availableAirports, { iata: this.selectedArrival });
          return airport.id;
        },
        set(value) {
          if (!value) return;

          this.WBLogArrival = value;
          this.destinationEditMode = false;
        },
      },
      canUpdateAirports() {
        return (this.isDispatcher || this.isPilot) && (this.log.status !== consts.STATUS_COMPLETED);
      },
    },

    methods: {
      ...mapActions('wb', [
        'patchFlight',
      ]),
      handleRestoreOriginClick() {
        this.WBLogDeparture = null;
      },
      handleRestoreDestinationClick() {
        this.WBLogArrival = null;
      },
    },

    data() {
      return {
        originEditMode: false,
        destinationEditMode: false,
      };
    },

    validations: {
      aircraft: {
        required: requiredIf('validate'),
      },
      flight: {
        required: requiredIf('validate'),
      },
    },
  };
</script>

<template>
  <div class="panel panel-body">
    <div v-loading="availableAircrafts.length === 0" class="wb-flight">
      <div class="wb-flight__cell" :class="{ error: $v.aircraft.$invalid }">
        <label class="control-label">Aircraft</label>
        <div class="wb-flight__origin-wrapper">
          <el-select v-model="aircraft"
                     placeholder="Pick Aircraft"
                     :disabled="disabled"
                     size="small"
                     clearable
                     filterable>
            <el-option
              v-for="ac in availableAircrafts"
              :key="ac.id"
              :value="ac.id"
              :label="ac.registration"
            />
          </el-select>
        </div>
        <span class="form-group__message" v-if="!$v.aircraft.required">
          Field is required
        </span>
      </div>

      <div class="wb-flight__cell">
        <label class="control-label">Aircraft Type</label>
        <div class="wb-flight__origin-wrapper">
          <div class="wb-flight__readonly-value">{{ selectedAircraftType.name || '—' }}</div>
        </div>
      </div>

      <div class="wb-flight__cell">
        <label class="control-label">Origin</label>
        <div v-if="originEditMode">
          <el-select v-model="departure"
                     size="small"
                     placeholder="Pick Airport"
                     filterable
                     clearable>
            <el-option v-for="airport in availableAirports"
                       :key="airport.id"
                       :value="airport.id"
                       :label="airport.iata" />
          </el-select>
        </div>
        <div v-else>
          <div class="wb-flight__airport-wrapper">
            <div class="wb-flight__readonly-value">{{ selectedDeparture || '—' }}</div>
            <p class="wb-flight__edit-airport" v-if="canUpdateAirports && selectedDeparture">
              <span v-if="WBLogDeparture">
                Diverted flight origin is applied. You can
                <a @click.stop="originEditMode = true">pick another one</a> or
                <a class="wb-flight__restore-airport" @click.stop="handleRestoreOriginClick">
                  restore it from the picked flight
                </a>
              </span>
              <span v-else>
                Was this scheduled flight diverted? If so,
                <a @click.stop="originEditMode = true" >update the origin</a>
              </span>
            </p>
          </div>
        </div>
      </div>

      <div class="wb-flight__cell">
        <label class="control-label">Destination</label>
        <div v-if="destinationEditMode">
          <el-select v-model="arrival"
                     size="small"
                     placeholder="Pick Airport"
                     filterable
                     clearable>
            <el-option v-for="airport in availableAirports"
                       :key="airport.id"
                       :value="airport.id"
                       :label="airport.iata" />
          </el-select>
        </div>
        <div v-else>
          <div class="wb-flight__airport-wrapper">
            <div class="wb-flight__readonly-value">{{ selectedArrival || '—' }}</div>
            <p class="wb-flight__edit-airport" v-if="canUpdateAirports && selectedArrival">
              <span v-if="WBLogArrival">
                Diverted flight destination is applied. You can
                <a @click.stop="destinationEditMode = true">pick another one</a> or
                <a
                  class="wb-flight__restore-airport"
                  @click.stop="handleRestoreDestinationClick">restore it from the picked flight</a>
              </span>
              <span v-else>
                Was this scheduled flight diverted? If so,
                <a @click.stop="destinationEditMode = true">update the destination</a>
              </span>
            </p>
          </div>
        </div>
      </div>

      <div class="wb-flight__cell">
        <label class="control-label">Date</label>
        <div class="wb-flight__readonly-value">{{ selectedDate || '—' }}</div>
      </div>

      <div class="wb-flight__cell" :class="{ error: $v.flight.$invalid }">
        <pick-flight-btn
          label="Flight"
          v-model="flight"
          :flight="flight_data"
          :disabled="disabled"
        />

        <span class="form-group__message" v-if="!$v.flight.required">
          Field is required
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "numpad-field";
  @import '../../../../../../scss/bs-variables';

  .wb-flight {
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;

    &__cell {
      flex: 1 1;
      margin-left: 10px;
      padding: 5px 10px;

      &:first-child {
        margin-left: 0;
      }

      @media screen and (max-width: $screen-sm-max){
        flex: 1 1 50%;
        margin-left: 0;
      }

      @media screen and (max-width: $screen-xs-max){
        flex: 1 1 100%;
        margin-left: 0;
      }

      .el-select {
        display: block;
      }
    }

    &__number {
      @include numpad-field;
    }

    &__readonly-value {
      font-size: 16px;
      line-height: 32px;
    }

    &__edit-airport {
      font-size: 12px;
      color: #999;
      margin-left: 15px;
      line-height: 1.1;
      margin-bottom: 0;
    }

    &__restore-airport {
      color: $red;
    }

    &__airport-wrapper {
      display: flex;
      align-items: center;
    }
  }
</style>
