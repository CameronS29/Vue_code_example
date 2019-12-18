<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import { Row, Col, RadioButton, RadioGroup } from 'element-ui';
  import { find } from 'lodash';

  import Collapse from 'Common/Collapse.vue';
  import ButtonEl from 'Common/Button.vue';
  import Group from 'Common/Form/Group.vue';
  import Selectize from '../../../../fields/Selectize.vue';
  import EditFlightModal from '../../../ManifestView/Update/EditFlight/Modal.vue';
  import PickFlightModal from '../../../ManifestView/Update/PickFlight/Modal.vue';
  import manifestApi from '../../../../../api/pilotManifest';
  import {
    SET_DIVERSION_TYPE,
    UPDATE_FLIGHT,
    DIVERSION,
    NO_DIVERSION
  } from '../../../../../store/modules/flightlog/consts';

  export default {
    data() {
      return {
        fields: '',
      };
    },

    components: {
      ElRow: Row,
      ElCol: Col,
      ElRadioButton: RadioButton,
      ElRadioGroup: RadioGroup,
      Collapse,
      Group,
      Selectize,
      EditFlightModal,
      PickFlightModal,
      ButtonEl,
    },

    computed: {
      ...mapGetters('flightlog', [
        'flightlog',
        'progress',
        'diversionTypes',
        'isLoading',
        'actualOrigin',
        'actualDestination'
      ]),

      ...mapGetters('pilotManifest', [
        'availableProfiles',
        'manifest',
        'availableAirports',
      ]),

      ...mapGetters('offline', ['onlineStatus']),

      isFlightLogOpen() {
        return this.flightlog.open;
      },
      isDiverted() {
        return this.flightlog.flight.diversion_type === DIVERSION;
      },
      isNotDiverted() {
        return this.flightlog.flight.diversion_type === NO_DIVERSION;
      },
      isScheduled() {
        return this.flightlog.flight.type_of_operations === 'Scheduled';
      },
      originId() {
        if (this.availableAirports.length > 0 && this.flightlog.flight.origin) {
          return find(this.availableAirports, { iata: this.flightlog.flight.origin }).id;
        }
        return undefined;
      },
      diversionTypeValue: {
        get() {
          return this.flightlog.flight.diversion_type;
        },
        set(value) {
          this.updateDiversionType(value);
        }
      },
      actualDestinationSelection: {
        get() {
          return this.flightlog.flight.actual_destination_id;
        },
        set(value) {
          this.updateActualDestination(value);
        }
      },
      actualOriginSelection: {
        get() {
          return this.flightlog.flight.actual_origin_id;
        },
        set(value) {
          this.updateActualOrigin(value);
        }
      }
    },

    methods: {
      ...mapMutations('flightlog', [UPDATE_FLIGHT, SET_DIVERSION_TYPE]),
      ...mapActions('pilotManifest/editFlight', {
        setFlight: 'setFlight',
        closeEditFlightModal: 'reset',
      }),
      ...mapActions('pilotManifest/pickFlight', {
        setFilterData: 'setFilterData',
        closePickFlightModal: 'reset',
      }),
      ...mapActions('flightlog', [
        'setPartialUpdate',
        'patchFlightlog',
        'updateDiversionType',
        'updateActualDestination',
        'updateActualOrigin',
        'copyFlight'
      ]),

      showEditFlightModal(fields) {
        this.fields = fields;
        this.setFlight(this.flightlog.flight);
      },

      handleUpdateFlight(flight) {
        this.closeEditFlightModal();
        this[UPDATE_FLIGHT](flight);
        this.$notify({
          type: 'success',
          title: 'Flight Updated',
          message: 'Flight has been updated successfully',
        });
      },

      showPickFlightModal() {
        this.setFilterData({
          origin: this.originId,
          date: this.manifest.created_on,
        });
      },

      async handleCopyFlight() {
        const resp = await this.copyFlight(this.flightlog.flight.id);

        this.saving = true;
        const logResponse = await manifestApi.createLog({
          manifest: this.manifest.id,
          flight: resp.flight_id,
        });

        this.$router.push({ name: 'pilot_log_edit', params: { id: this.manifest.id, logId: logResponse.id } });
      },

      handlePickFlight(flight_id) {
        this.closePickFlightModal();
        this.setPartialUpdate({ flight_id });
        this.patchFlightlog()
          .catch(() => this.$notify({
            type: 'error',
            title: 'Error on Flight Update',
            message: 'Flight is not updated successfully. Please try it later.',
          }));
      },
    },
  };
</script>

<template>
  <collapse title="FLIGHT INFORMATION" :gutter-color="false" class="flight-information">
    <edit-flight-modal :editable-fields="fields" :create-log="false" @flight:updated="handleUpdateFlight"/>
    <pick-flight-modal :create-log="false" :show-unscheduled="false" @flight:picked="handlePickFlight"/>
    <el-radio-group v-model="diversionTypeValue" size="small" v-if="flightlog.open">
      <el-radio-button :label="diversionType.value" v-for="diversionType in diversionTypes"
                       :key="diversionType.id">
        {{ diversionType.name }}
      </el-radio-button>
    </el-radio-group>
    <el-row :gutter="30">
      <el-col :lg="4">
        <group label="Flight number">
          {{ flightlog.flight.flight_number }}
        </group>
      </el-col>
      <el-col :lg="4">
        <group label="Origin">
          {{ flightlog.flight.origin }}
          <span v-if="flightlog.flight.origin != flightlog.flight.actual_origin && flightlog.flight.actual_origin">
            (actual: {{ flightlog.flight.actual_origin }})
          </span>
        </group>
      </el-col>
      <el-col :lg="6">
        <group label="Scheduled Depature Date/time (UTC)">
          {{ flightlog.flight.scheduled_departure|longDT }}
        </group>
      </el-col>
      <el-col :lg="4">
        <group label="Destination">
          {{ flightlog.flight.destination }}
          <span
            v-if="flightlog.flight.destination != flightlog.flight.actual_destination && flightlog.flight.actual_destination">
            (actual: {{ flightlog.flight.actual_destination }})
          </span>
        </group>
      </el-col>
      <el-col :lg="6">
        <group label="Scheduled Arrival Date/time (UTC)">
          {{ flightlog.flight.scheduled_arrival|longDT }}
        </group>
      </el-col>
    </el-row>

    <el-row :gutter="30">
      <el-col :lg="4">
        <group label="Aircraft">
          {{ flightlog.manifest.tail_number }}
          {{ flightlog.manifest.aircraft_type }}
        </group>
      </el-col>
      <el-col :lg="6">
        <group label="Type of Operation">
          {{ flightlog.flight.type_of_operations }}
          {{ flightlog.flight.operating_under }}
        </group>
      </el-col>
      <el-col :lg="6">
        <group label="Actual origin" v-if="isDiverted">
          <el-select v-model="actualOriginSelection" filterable placeholder="Select origin">
            <el-option
              v-for="airport in availableAirports"
              :key="airport.id"
              :label="airport.iata"
              :value="airport.id">
            </el-option>
          </el-select>
        </group>
      </el-col>
      <el-col :lg="6">
        <group label="Actual destination" v-if="isDiverted">
          <el-select v-model="actualDestinationSelection" filterable placeholder="Select destination">
            <el-option
              v-for="airport in availableAirports"
              :key="airport.id"
              :label="airport.iata"
              :value="airport.id">
            </el-option>
          </el-select>
        </group>
      </el-col>
    </el-row>
    <el-row :gutter="30" class="flight-information__btn-row">
      <el-col :sm="12" :md="8" v-if="!isScheduled">
        <button-el class="flight-information__btn"
                   type="danger"
                   v-if=""
                   @click="showEditFlightModal('origin,destination')"
                   :disabled="isLoading || !onlineStatus || !isFlightLogOpen">
          Update log due to a diversion
        </button-el>
      </el-col>
      <el-col :sm="12" :md="8" v-if="!isScheduled">
        <button-el class="flight-information__btn"
                   type="warning"
                   @click="showEditFlightModal('all')"
                   :disabled="isLoading || !isFlightLogOpen">
          Edit unscheduled flight details
        </button-el>
      </el-col>
      <el-col :sm="12" :md="8">
        <button-el class="flight-information__btn"
                   type="success"
                   @click="showPickFlightModal"
                   :disabled="availableAirports.length === 0 || isLoading || !onlineStatus || !isFlightLogOpen">
          Select a different scheduled flight
        </button-el>
      </el-col>
      <el-col :sm="12" :md="8" v-if="!isNotDiverted">
        <button-el class="flight-information__btn"
                   type="success"
                   @click="handleCopyFlight">
          Continue flight
        </button-el>
      </el-col>
    </el-row>
  </collapse>
</template>

<style lang="scss">
  .flight-information {
    &__btn-row {
      margin-bottom: -10px;
    }
    &__btn {
      margin-bottom: 10px;
      width: 100%;
    }
    .btq-form {
      &__group {
        margin-bottom: 25px;
      }

      &__label {
        font-weight: bold;
        margin-bottom: 10px;
      }
    }
  }
</style>
