<script>
  import {mapGetters, mapActions, mapMutations, mapState} from 'vuex';
  import {and, or, required, requiredIf} from 'vuelidate/lib/validators';
  import moment from 'moment';
  import Engine from '../Engine/Common/Form.vue';
  import Selectize from '../../fields/Selectize.vue';
  import FlightLogList from '../../FlightLog/FlightLogList.vue';
  import Datepicker from '../../fields/Datepicker.vue';
  import TextField from 'Common/Form/Fields/TextAreaField.vue';
  import Block from 'Common/Block.vue';
  import VerticalForm from 'Common/Form/VerticalForm.vue';
  import Group from 'Common/Form/Group.vue';
  import { DateTime } from 'luxon';

  import {
    SET_AIRCRAFT,
    SET_ENGINE_SWAP,
    SET_INSTALL_DATE,
    SET_LAST_LOG, SET_NEW_ENGINE_OPENED,
    RESET_CORRECTION,
    SET_POSITION, RESET_ENGINE, UPDATE_CORRECTION
  } from "../../../store/modules/aircraft/consts";
  import {
    RESET_PAGE,
    SET_AIRCRAFT_FILTER,
    SET_DATETIME_OUT_1,
    SET_DATETIME_OUT_2,
    SET_IS_LAST_FILTER,
  } from "../../../store/modules/flightlog/consts";
  import {PUSH_TO_POOL} from "../../../store/modules/jobs";
  import Log from '../Partials/Log.vue';
  import * as consts from "store/modules/flightlog/consts";
  import {RESET_FILTERS} from "store/modules/flightlog/consts";

  const correctionFloatField = function (field) {
    return {
      get() {
        return this.correction[field];
      },
      set(value) {
        let payload = {};
        payload[field] = parseFloat(value) || 0;
        this[UPDATE_CORRECTION](payload);
      },
    }
  };
  const correctionTextField = function (field) {
    return {
      get() {
        return this.correction[field];
      },
      set(value) {
        let payload = {};
        payload[field] = value;
        this[UPDATE_CORRECTION](payload);
      },
    }
  };
  export default {
    props: {
      aircraftId: Number,
      id: Number,
    },
    computed: {
      ...mapGetters("flightlog", [
        "filters",
      ]),
      ...mapGetters("flightlog/log", [
        "log",
      ]),
      ...mapGetters("engine", [
        "newEngineOpened"
      ]),
      ...mapState("aircraft/correction", [
        "correction"
      ]),
      ...mapState("aircraft/correction", [
        "correction"
      ]),
      ...mapGetters("aircraft/engineCorrections", [
        "corrections",
        "selectedAircraft"
      ]),
      ...mapGetters("aircraft/correction", [
        "installDate",
        "installDate",
        "aircraft",
        "lastLog",
        "selectedAircraft",
      ]),
      newInitialHobbs() {
        return parseFloat(this.log.final_hobbs) + parseFloat(this.hobbs);
      },
      newAftt() {
        return parseFloat(this.log.state.tat) + parseFloat(this.aftt);
      },
      newLandings() {
        return parseFloat(this.log.state.landings) + parseFloat(this.landings);
      },
      newEngine1Time() {
        return parseFloat(this.log.state.engine_1_time) + parseFloat(this.engine_1_time);
      },
      newEngine1Cycles() {
        return parseFloat(this.log.state.engine_1_cycles) + parseFloat(this.engine_1_cycles);
      },
      newEngine2Time() {
        return parseFloat(this.log.state.engine_2_time) + parseFloat(this.engine_2_time);
      },
      newEngine2Cycles() {
        return parseFloat(this.log.state.engine_2_cycles) + parseFloat(this.engine_2_cycles);
      },
      selectedLog: {
        get() {
          return this.lastLog;
        },
        set(value) {
          this[SET_LAST_LOG](parseInt(value));
          this.getFlightLog(value);
        }
      },
      installDateValue: {
        get() {
          if (this.installDate) {
            return moment.utc(this.installDate).format("MM/DD/YYYY");
          }
        },
        set(value) {
          if (value) {
            value = moment.utc(value, "MM/DD/YYYY").format();
          }
          this[SET_INSTALL_DATE](value);
          this[RESET_PAGE]();
          this[SET_DATETIME_OUT_2](moment.utc(value).endOf('day').format());
        },
      },
      hobbs: correctionFloatField("hobbs"),
      aftt: correctionFloatField("aftt"),
      landings: correctionFloatField("landings"),
      engine_1_time: correctionFloatField("engine_1_time"),
      engine_1_cycles: correctionFloatField("engine_1_cycles"),
      engine_2_time: correctionFloatField("engine_2_time"),
      engine_2_cycles: correctionFloatField("engine_2_cycles"),
      comments: correctionTextField("notes"),
      tail_number: correctionTextField("tail_number"),
    },
    methods: {
      ...mapActions("aircraft/engineCorrections", [
        "getCorrections",
        "deleteCorrection",
      ]),
      ...mapActions("aircraft", [
        "getAircrafts",
      ]),
      ...mapActions("flightlog", [
        "updateFlightLog",
      ]),
      ...mapActions("flightlog/log", [
        "getFlightLog",
        "getFeatureFlightLog",
      ]),
      ...mapMutations("flightlog", [
        RESET_PAGE,
        RESET_FILTERS,
        SET_DATETIME_OUT_1,
        SET_DATETIME_OUT_2,
      ]),
      ...mapActions("aircraft/correction", [
        "updateCorrection",
        "getCorrection"
      ]),
      ...mapMutations("jobs", [
        PUSH_TO_POOL
      ]),
      ...mapMutations("aircraft/correction", [
        SET_ENGINE_SWAP,
        SET_INSTALL_DATE,
        SET_LAST_LOG,
        SET_AIRCRAFT,
        SET_POSITION,
        UPDATE_CORRECTION,
        RESET_CORRECTION
      ]),
      ...mapMutations("engine", [
        SET_NEW_ENGINE_OPENED,
      ]),
      ...mapMutations("flightlog", [
        SET_AIRCRAFT_FILTER,
        SET_IS_LAST_FILTER,
      ]),
      engineCreated(value) {
        this.swapEngine = value.id;
      },
      createNew() {
        this.swapEngine = null;
        this[SET_NEW_ENGINE_OPENED](true);
      },
      selectLog(log) {
        this.selectedLog = log.id;
      },
      saveCorrection() {
        this.$v.$touch();
        if (this.$v.$invalid) {
          $("html, body").stop().animate({scrollTop: 0}, 500, 'swing');
        } else {
          this.updateCorrection().then(() => {
            this.$router.push({name: 'aircraft_adjust_list', params: {aircraft: this.aircraft}});
          });
        }
      },
      mount() {
        this[RESET_CORRECTION]();
        this[RESET_FILTERS]();
        this[SET_IS_LAST_FILTER](true);
        if (this.id) {
          this.$store.watch(() => {
            return this.aircraft;
          }, () => {
            this[SET_AIRCRAFT_FILTER](this.aircraft);
            this.getCorrections(parseInt(this.aircraft));
          });
          this.getCorrection(this.id).then(() => {
            this.getFlightLog(this.selectedLog);
            this.getFeatureFlightLog(this.selectedLog);
          });
        } else {
          this[SET_AIRCRAFT](parseInt(this.aircraftId));
          this.getCorrections(parseInt(this.aircraftId));
          this[SET_AIRCRAFT_FILTER](this.aircraftId);
        }
        this.updateFlightLog();
      },
    },
    validations: {
      installDateValue: {required},
      comments: {required},
      selectedLog: {
        required,
        alreadySelected(value) {
          for (let correction of this.corrections) {
            if (correction.id === parseInt(this.id)) {
              continue;
            }
            if (correction.last_log === this.lastLog) {
              return false;
            }
          }
          return true;
        }
      },
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        vm.mount();
      });
    },
    beforeRouteUpdate(to, from, next) {
      next(vm => {
        vm.mount();
      });
    },
    components: {
      Engine,
      Selectize,
      Datepicker,
      FlightLogList,
      Log,
      Block,
      TextField,
      VerticalForm,
      Group
    }
  }
</script>

<style lang="scss" src="../scss/swap.scss"></style>
<style lang="scss" src="../scss/engine.scss"></style>
<template>
  <block title="Adjustment" :no-padding="true">
    <vertical-form>
      <group :error="$v.installDateValue.$error" label="Date of Adjustment">
        <div slot="errors" v-if="!$v.installDateValue.required">
          Date of Adjustment is required
        </div>
        <datepicker v-model="installDateValue"></datepicker>
      </group>
      <group v-if="!selectedLog" label="Select the last flight log" :error="$v.selectedLog.$error">
        <div slot="errors" v-if="!$v.selectedLog.required">Please, select last log</div>
        <flight-log-list @logSelected="selectLog" :start-date="installDateValue" v-if="filters.aircraft">
        </flight-log-list>
      </group>
      <group v-else>
        <span slot="title">Last log
          <button class="btn btn-primary btn-xs" @click="selectedLog = null">
            <i class="fa fa-pencil" aria-hidden="true"></i>
          </button>
        </span>
        <div slot="errors" v-if="!$v.selectedLog.alreadySelected">
          This log was already selected
        </div>
        <log v-if="log.id"></log>
      </group>

      <group label="Adjustments">
        <table class="table">
          <thead>
          <tr>
            <th></th>
            <th>Current</th>
            <th>Adjustment</th>
            <th>New Value</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>Tail number</td>
            <td>
                  <span v-if="log.state" :class="{'strike': log.state.tail_number != tail_number}">
                    {{ log.state.tail_number }}
                  </span>
            </td>
            <td>
              <input class="form-control" v-model="tail_number">
            </td>
            <td><span v-if="log.state && tail_number">{{ tail_number }}</span></td>
          </tr>
          <tr>
            <td>Hobbs</td>
            <td>
              <span :class="{'strike': hobbs != 0}" v-if="log.state">{{ log.final_hobbs }}</span>
            </td>
            <td>
              <input type="number" class="form-control" v-model="hobbs">
            </td>
            <td><span v-if="log.state && newInitialHobbs">{{ newInitialHobbs }}</span></td>
          </tr>
          <tr>
            <td>AFTT</td>
            <td>
              <span :class="{'strike': aftt != 0}" v-if="log.state">{{ log.state.tat }}</span>
            </td>
            <td>
              <input type="number" class="form-control" v-model="aftt">
            </td>
            <td><span v-if="log.state && newAftt">{{ newAftt }}</span></td>
          </tr>
          <tr>
            <td>Landings</td>
            <td>
                  <span :class="{'strike': landings != 0}" v-if="log.state">
                    {{ log.state.landings }}</span>
            </td>
            <td>
              <input type="number" class="form-control" v-model="landings">
            </td>
            <td><span v-if="log.state && newLandings">{{ newLandings }}</span></td>
          </tr>
          <tr>
            <td>Engine 1 cycles</td>
            <td>
                  <span :class="{'strike': engine_1_cycles != 0}" v-if="log.state">
                    {{ log.state.engine_1_cycles }}</span>
            </td>
            <td>
              <input type="number" class="form-control" v-model="engine_1_cycles">
            </td>
            <td><span v-if="log.state && newEngine1Time">{{ newEngine1Cycles }}</span></td>
          </tr>
          <tr>
            <td>Engine 1 time</td>
            <td>
                  <span :class="{'strike': engine_1_time != 0}" v-if="log.state">
                    {{ log.state.engine_1_time }}</span>
            </td>
            <td>
              <input type="number" class="form-control" v-model="engine_1_time">
            </td>
            <td><span v-if="log.state && newEngine1Time">{{ newEngine1Time }}</span></td>
          </tr>
          <tr v-if="log.state && log.state.engine_2_cycles">
            <td>Engine 2 cycles</td>
            <td>
                  <span :class="{'strike': engine_2_cycles != 0}" v-if="log.state">
                    {{ log.state.engine_2_cycles }}</span>
            </td>
            <td>
              <input type="number" class="form-control" v-model="engine_2_cycles">
            </td>
            <td><span v-if="log.state && newEngine2Time">{{ newEngine2Cycles }}</span></td>
          </tr>
          <tr v-if="log.state && log.state.engine_2_time">
            <td>Engine 2 time</td>
            <td>
                  <span :class="{'strike': engine_2_time != 0}" v-if="log.state">
                    {{ log.state.engine_2_time }}</span>
            </td>
            <td>
              <input type="number" class="form-control" v-model="engine_2_time">
            </td>
            <td><span v-if="log.state && newEngine2Time">{{ newEngine2Time }}</span></td>
          </tr>
          </tbody>
        </table>
      </group>
      <group label="Comments" :error="$v.comments.$error">
        <text-field v-model="comments"></text-field>
        <div v-if="!$v.comments.required" slot="errors">
          Comments are required
        </div>
      </group>
      <group>
        <button class="swap" @click="saveCorrection">Confirm adjustment</button>
      </group>
    </vertical-form>
  </block>
</template>
<style>
  .strike {
    text-decoration: line-through;
  }
</style>
