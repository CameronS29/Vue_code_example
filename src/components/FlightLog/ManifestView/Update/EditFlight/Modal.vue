<script>
  import {mapGetters, mapActions, mapMutations} from 'vuex';
  import { isEmpty } from 'lodash';
  import find from 'lodash/find';
  import filter from 'lodash/filter';
  import {Row, Col} from 'element-ui';
  import Modal from 'Common/Modal.vue';
  import Collapse from 'Common/Collapse.vue';
  import ButtonEl from "Common/Button.vue";
  import Card from 'Common/Card.vue';
  import SelectField from "../../../../fields/Selectize.vue";
  import TextField from "Common/Form/Fields/TextField.vue";
  import DatetimeInput from "../../../../fields/DatetimeInput.vue";
  import {mapFormTextField} from "../../../../../store/helpers/forms";
  import {required} from 'vuelidate/lib/validators';
  import Group from "Common/Form/Group.vue";
  import manifestApi from "../../../../../api/pilotManifest";

  export default {
    props: {
      editableFields: {
        type: String,
        default: 'all'
      },
      createLog: {
        type: Boolean,
        default: true,
      }
    },
    components: {
      ElRow: Row,
      ElCol: Col,
      Collapse,
      Modal,
      Card,
      Group,
      TextField,
      SelectField,
      DatetimeInput,
      ButtonEl,
    },
    created() {
      if (this.availableAirports.length == 0) {
        this.getAvailableAirports();
      }

      if (this.operations.length == 0) {
        this.getFlightOptions();
      }
    },
    computed: {
      ...mapGetters('pilotManifest/editFlight', [
        'active',
        'flight',
        'progress'
      ]),
      ...mapGetters('pilotManifest', [
        'manifest',
        'operations',
        'availableAirports',
        'opsUnder',
      ]),
      ...mapFormTextField("pilotManifest/editFlight/flight", "pilotManifest/editFlight/UPDATE_EDIT_FLIGHT", [
        "flight_number",
        "scheduled_departure",
        "scheduled_arrival",
        "origin",
        "destination",
        "operating_under",
        "type_of_operations"
      ]),
      ...mapGetters(
        'offline',
        ['onlineStatus']
      ),
      isShown() {
        return !!this.active;
      },
      manifestOpType() {
        const op = find(this.operations, {id: this.manifest.op_type}) || {name: ''};
        return op.name;
      },
      availableOpers() {
        return this.operations;
      },
      isManifestRelated() {
        return !isEmpty(this.manifest);
      },
    },

    methods: {
      ...mapActions('pilotManifest/editFlight', [
        'reset',
        'saveFlight',
        'createNewLogWithFlight'
      ]),
      ...mapActions('pilotManifest', [
        'getAvailableAirports',
        'getFlightOptions',
      ]),
      disabled(fieldName) {
        if ((fieldName == 'origin' || fieldName == 'destination') && !this.onlineStatus) {
          return true;
        }

        if (this.editableFields === 'all') {
          return false;
        } else {
          return this.editableFields.indexOf(fieldName) == -1;
        }
      },
      createNewLog() {
        this.createNewLogWithFlight(this.manifest.id)
          .then((res) => {
            this.reset();
            this.$emit('log:created', res);
          }).catch(() => {
          this.$notify({
            type: 'error',
            title: 'Cannot create new flightlog',
            message: 'Check your network connection or try again later',
          });
        });
      },
      saveFlightInfo() {
        this.$v.$touch();
        if (!this.$v.$error) {
          this.saveFlight()
            .then(() => {
              if (this.createLog) {
                this.createNewLog();
              } else {
                this.$emit('flight:updated', this.flight);
              }
            })
            .catch(() => {
              this.$notify({
                type: 'error',
                title: 'Cannot save flight',
                message: 'Check your network connection or try again later',
              });
            });
        }
      }
    },
    fieldErrors: {
      arrivalError: (vm) => {
        return "Arrival time should be greater than departure time"
      },
    },
    validations() {
      return {
        origin: {required},
        destination: {required},
        operating_under: {required},
        type_of_operations: {required},
        flight_number: {required},
        scheduled_departure: {required},
        scheduled_arrival: {
          required,
          arrivalError(val) {
            if (this.scheduled_arrival && this.scheduled_departure && this.scheduled_arrival <= this.scheduled_departure) {
              return false;
            }
            return true;
          }
        },
      };
    },
  };
</script>

<template>
  <modal :show="isShown" @close="reset" transparent>
    <card mode="dark" class="edit-flight__card">
      <collapse title="Edit Flight">
        <el-row v-if="isManifestRelated">
          <el-col :sm="12" :md="8">
            <group label="Aircraft Tail Number">
              <span>{{manifest.tail_number}}</span>
            </group>
          </el-col>

          <el-col :sm="12" :md="8">
            <group label="Aircraft Type">
              <span>{{manifest.aircraft_type}}</span>
            </group>
          </el-col>
          <el-col :sm="12" :md="8">
            <group label="Manifest Operation Type">
              <span>{{manifestOpType}}</span>
            </group>
          </el-col>
        </el-row>

        <el-row>
          <el-col :sm="12" :md="8">
            <group label="Flight Number" :validation-data="$v.flight_number">
              <text-field v-model="flight_number" :disabled="disabled('flight_number')"></text-field>
            </group>
          </el-col>
          <el-col :sm="12" :md="8">
            <group label="Operationg Under" :validation-data="$v.operating_under">
              <select-field v-model="operating_under" :items="opsUnder" :minimal="true" label="operation"
                            field="operation" id-field="operation" :disabled="disabled('operating_under')">
              </select-field>
            </group>
          </el-col>
          <el-col :sm="12" :md="8">
            <group label="Reason for unscheduled flight" :validation-data="$v.type_of_operations">
              <select-field v-model="type_of_operations" :items="availableOpers" :minimal="true" id-field="name"
                            field="name"
                            :disabled="disabled('type_of_operations')" label="reason">
              </select-field>
            </group>
          </el-col>
        </el-row>

        <el-row>
          <el-col :sm="24" :md="8">
            <group label="Scheduled Origin" :validation-data="$v.origin">
              <select-field v-model="origin" :items="availableAirports" label="origin"
                            :minimal="true" id-field="iata" field="iata" :disabled="disabled('origin')">
              </select-field>
            </group>
          </el-col>
          <el-col :sm="24" :md="16">
            <group label="Scheduled Departure date/time (UTC)" :validation-data="$v.scheduled_departure">
              <datetime-input v-model="scheduled_departure"
                              :disabled="disabled('scheduled_departure')"></datetime-input>
            </group>
          </el-col>
        </el-row>

        <el-row>
          <el-col :sm="24" :md="8">
            <group label="Scheduled Destination" :validation-data="$v.destination">
              <select-field v-model="destination" :items="availableAirports" label="destination"
                            :minimal="true" id-field="iata" field="iata"
                            :disabled="disabled('destination')"></select-field>
            </group>
          </el-col>
          <el-col :sm="24" :md="16">
            <group label="Scheduled Arrival date/time (UTC)" :validation-data="$v.scheduled_arrival">
              <datetime-input v-model="scheduled_arrival" :disabled="disabled('scheduled_arrival')"></datetime-input>
            </group>
          </el-col>
        </el-row>

        <el-row class="edit-flight__btns">
          <el-col :span="24">
            <button-el type="success" @click="saveFlightInfo" :disabled="progress">
              Save
              <i class="fa fa-save" v-if="!progress"></i>
              <i class="fa fa-circle-o-notch fa-spin fa-1x fa-fw" v-else></i>
            </button-el>
            <button-el type="default" @click="reset">
              Cancel
            </button-el>
          </el-col>
        </el-row>
      </collapse>
    </card>
  </modal>
</template>


<style lang="scss">
  @import '../../../../../../scss/bs-variables';

  .edit-flight {
    &__card {
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      width: 90vw;
      padding: 15px;
      overflow: auto;
      &.card_dark {
        color: inherit;
      }

      .btq-form__label {
        margin-bottom: 0;
      }
    }

    &__title {
      margin-bottom: 15px;
      font-weight: bold;
      font-size: 24px;
      color: white;
    }

    &__btns {
      margin-top: 10px;
    }

    @media screen and (max-width: $screen-md-max) {
      &__content {
        flex-wrap: wrap;
      }
    }

  }

  @media screen and (max-width: $screen-xs-max) {
    .edit-flight__card {
      .picker__group {
        flex-wrap: wrap;
      }
      .picker_inline {
        flex-basis: 100%;
        margin-bottom: 5px;
      }
    }
  }
</style>
