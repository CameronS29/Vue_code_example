<script type="text/jsx">
  import Inputmask from "inputmask";
  import {mapGetters, mapActions, mapMutations, mapState} from 'vuex';
  import Block from 'Common/Block.vue';
  import VerticalForm from 'Common/Form/VerticalForm.vue';
  import Group from 'Common/Form/Group.vue';
  import TextField from 'Common/Form/Fields/TextAreaField.vue';
  import Engine from '../Common/Form.vue';
  import Selectize from '../../../fields/Selectize.vue';
  import Log from '../../Partials/Log.vue';
  import FlightLogList from '../../../FlightLog/FlightLogList.vue';
  import Datepicker from '../../../fields/Datepicker.vue';
  import Validations from "./Mixins/Validations";
  import Fields from "./Mixins/Fields";
  import Confirmations from "./Mixins/Confirmations";

  import {
    SET_AIRCRAFT,
    SET_NEW_ENGINE_OPENED,
    RESET_SWAP,
    SET_POSITION,
    RESET_ENGINE,
    SET_REMOVAL_DATE,
    SET_SWAP_TYPE,
    SWAP_REMOVAL,
    SWAP_INSTALL,
    SET_DISPLAY_INSTALL,
    SET_CYCLES_AT_INSTALL,
    SET_TIME_AT_INSTALL,
    SET_SWAP_DATE,
    SET_TIME_EDIT
  } from "../../../../store/modules/aircraft/consts";
  import {
    RESET_PAGE,
    SET_AIRCRAFT_FILTER,
    SET_DATETIME_OUT_1,
    SET_DATETIME_OUT_2,
    SET_DISTINCT,
    SET_IS_LAST_FILTER,
    SET_SELECTED_ID
  } from "../../../../store/modules/flightlog/consts";
  import {PUSH_TO_POOL} from "../../../../store/modules/jobs";

  const DATE_FORMAT = "MM/DD/YYYY";

  export default {
    mixins: [
      Validations,
      Fields,
      Confirmations
    ],
    props: {
      enginePosition: Number,
      aircraftId: Number,
      id: Number,
    },
    data() {
      return {
        logsBetweenCache: {}
      }
    },
    created() {
      this.mount();
    },
    computed: {
      ...mapGetters("flightlog", [
        "filters",
      ]),
      ...mapGetters("flightlog/log", [
        "log",
      ]),
      ...mapState("aircraft/engineSwap", [
        "displayInstall",
        "engineTimeEdit"
      ]),
      ...mapGetters("engine", [
        "engines",
        "activeEngines",
        "freeEngines",
      ]),
      ...mapState("engine", {
        "newEngineOpened": "opened"
      }),
      ...mapGetters("aircraft/engineSwaps", [
        "swaps",
        "lastSwap",
        "selectedAircraft"
      ]),
      selectedLogDate() {
        return this.log.actual_datetime_out;
      },
      selectedSwapDate() {
        if (this.selectedSwap) {
          if (this.selectedSwap.installed_at_1) {
            return this.selectedSwap.installed_at_1.latest_saved_log_date;
          }
          if (this.selectedSwap.installed_at_2) {
            return this.selectedSwap.installed_at_2.latest_saved_log_date;
          }
        }
      },
      engineRemove() {
        return (this.selectedSwap && (this.selectedSwap.installed_at_1 || this.selectedSwap.installed_at_2)
          && this.originalSwap.engine != this.swap.engine);
      },
      isRemoval: {
        get() {
          return this.swapType === SWAP_REMOVAL;
        },
        set(value) {
          this[SET_SWAP_TYPE](value ? SWAP_REMOVAL : SWAP_INSTALL);
        }
      },
    },
    methods: {
      ...mapActions("engine", [
        "getEngines",
        "selectEngine"
      ]),
      ...mapActions("aircraft", [
        "getAircrafts",
      ]),
      ...mapActions("flightlog", [
        "updateFlightLog",
      ]),
      ...mapActions("flightlog/log", [
        "getFlightLog",
      ]),
      ...mapActions("aircraft/engineSwaps", [
        "getSwaps",
      ]),
      ...mapActions("aircraft/engineSwap", [
        "updateSwap",
        "recalcSwap",
        "getSwap",
        "updateEngineTimes"
      ]),
      ...mapMutations("jobs", [
        PUSH_TO_POOL
      ]),
      ...mapMutations("aircraft/engineSwap", [
        SET_DISPLAY_INSTALL,
        SET_SWAP_TYPE,
        SET_AIRCRAFT,
        SET_POSITION,
        SET_CYCLES_AT_INSTALL,
        SET_TIME_AT_INSTALL,
        RESET_SWAP,
        SET_TIME_EDIT
      ]),
      ...mapMutations("engine", [
        SET_NEW_ENGINE_OPENED,
        RESET_ENGINE
      ]),
      ...mapMutations("flightlog", [
        SET_AIRCRAFT_FILTER,
      ]),
      engineCreated(value) {
        this.swapEngine = value.id;
        this.updateEngineTimes();
      },
      createNew() {
        this.swapEngine = null;
        this[RESET_ENGINE]();
        this[SET_NEW_ENGINE_OPENED](true);
      },
      toggleEditEngine() {
        this[SET_TIME_EDIT](!this.engineTimeEdit);
      },
      selectLog(log) {
        this.selectedLog = log.id;
      },
      mount() {
        this[RESET_SWAP]();
        this[RESET_ENGINE]();
        this[SET_SELECTED_ID](null);
        this[SET_IS_LAST_FILTER](true);
        this.getEngines().then(() => {
          if (this.id && this.selectedSwap) {
            this.selectEngine(this.selectedSwap);
            if (!this.timeAtInstall) {
              this.updateEngineTimes();
            }
          }
        });
        if (this.id) {
          this.$store.watch(() => {
            return this.aircraft;
          }, () => {
            this.getSwaps(this.aircraft);
            this[SET_AIRCRAFT_FILTER](this.aircraft);
          });
          this.getSwap(this.id).then(() => {
            if (this.selectedLog) {
              this.getFlightLog(this.selectedLog);
            }
            if (this.id && this.selectedSwap) {
              this.selectEngine(this.selectedSwap);
            }
          });
        } else {
          this.getSwaps(this.aircraftId).then();
          this[SET_AIRCRAFT](parseInt(this.aircraftId));
          this[SET_AIRCRAFT_FILTER](this.aircraftId);
          this[SET_POSITION](this.enginePosition);
        }
      },
    },
    watch: {
      lastSwap() {
        if (!this.lastSwap.date_of_install) {
          this.$router.push({name: 'engine_swap_edit', params: {id: this.lastSwap.id}});
        }
      },
      selectedSwap() {
        this.updateEngineTimes();
      },
      '$router'() {
        vm.mount();
      }
    },
    components: {
      Engine,
      Selectize,
      Datepicker,
      FlightLogList,
      Log,
      Block,
      VerticalForm,
      TextField,
      Group
    }
  }
</script>
<template>
  <block title="Engine Swap" v-loading="engines.length <= 0" :no-padding="true">
    <vertical-form>
      <group label="Date of removal" :error="$v.removalDate.$error">
        <datepicker v-model="removalDate"></datepicker>
        <div slot="errors" v-if="!$v.removalDate.required">
          Date of removal is required
        </div>
        <div slot="errors" v-else-if="!$v.removalDate.overlap">
          Removal date overlaps with existing swap
        </div>
        <div slot="errors" v-if="!$v.removalDate.$pending && !$v.removalDate.noLogsBetween && isRemoval">
          Please choose different removal date. There are flight logs created after these date.
        </div>
      </group>
      <group>
        <div class="switcher">
          <el-switch v-model="isRemoval" on-text="" off-text=""></el-switch>
          <span @click="isRemoval=!isRemoval">
            This is a removal only, no engine is installed on this aircraft at this time</span>
        </div>
      </group>
      <div v-if="!isRemoval">
        <group label="Date of Install" :error="$v.installDate.$error">
          <datepicker v-model="installDate"></datepicker>
          <div v-if="!$v.installDate.required" slot="errors">
            Date of install is required
          </div>
          <div v-if="!$v.installDate.$pending && !$v.installDate.noLogsBetween" slot="errors">
            Please choose different install and removal dates. There are flight logs created during these dates.
          </div>
          <div v-else-if="!$v.installDate.lessThanField" slot="errors">
            Date of install can't be before date of removal
          </div>
          <div v-if="!$v.installDate.overlap" slot="errors">
            Install date overlaps with existing swap
          </div>
        </group>
        <div v-if="!defaultValue">
          <group :error="$v.selectedLogDate.$error || $v.selectedLog.$error"
                 label="Last flight log for previous engine">
            <div v-if="!selectedLog">
              <flight-log-list @logSelected="selectLog" :start-date="installDate"
                               v-if="filters.aircraft"></flight-log-list>
            </div>
            <div v-else>
              <button class="btn btn-primary" @click="selectedLog = null">
                <i class="fa fa-pencil" aria-hidden="true"></i>
              </button>
              <log v-if="log.id"></log>
            </div>
            <div slot="errors" v-if="$v.selectedLogDate.$error">
              This log was created after date of install
            </div>
            <div slot="errors" v-if="$v.selectedLog.$error">
              Please, select last log
            </div>
          </group>
        </div>
        <group v-else>
          <el-alert :title="'This engine is first for this aircraft'" type="info" show-icon>
          </el-alert>
        </group>
        <group label="Serial # of engine to be installed" :error="$v.swapEngine.$error">
          <el-select v-model="swapEngine" v-if="activeEngines || freeEngines" filterable placeholder="Engine serial">
            <el-option-group v-if="freeEngines"
                             label="Uninstalled">
              <el-option
                v-for="engine in freeEngines"
                v-if="engine"
                :key="engine.id"
                :label="engine.serial_number"
                :value="engine.id">
                <span style="float:right"></span>
                <span>{{ engine.serial_number }}</span>
              </el-option>
            </el-option-group>
            <el-option-group
              v-if="activeEngines"
              label="Active">
              <el-option
                v-for="engine in activeEngines"
                v-if="engine"
                :key="engine.id"
                :label="engine.serial_number"
                :value="engine.id">
                <span style="float:right"></span>
                <span>{{ engine.serial_number }}</span>
              </el-option>
            </el-option-group>
          </el-select>
          <button class="btn btn-primary" @click="createNew">Add new</button>
          <div slot="erorrs">
            Engine selection is required
          </div>
        </group>
        <group label="Date of removal" v-if="engineRemove" :error="$v.swapDate && $v.swapDate.error">
          <el-alert v-if="engineRemove"
                    title="Engine will be removed from current aircraft. Select date of removal:"
                    type="warning"
                    show-icon>
          </el-alert>
          <div slot="errors" v-if="!$v.swapDate.greaterOrEqualThanField">
            There should be no logs after selected date
          </div>
          <div slot="errors" v-if="!$v.swapDate.lessOrEqualThanField">
            This date should not be greater than install date
          </div>
          <div slot="errors" v-if="!$v.swapDate.required">
            This field is required
          </div>
          <datepicker v-model="swapDate"></datepicker>
        </group>
        <group>
          <span slot="title" v-if="selectedSwap">
            Current information for Serial # {{ selectedSwap.serial_number }}
            <button class="btn btn-primary btn-xs" @click="toggleEditEngine()" v-if="selectedSwap">
              <i class="fa fa-pencil" aria-hidden="true"></i>
            </button>
          </span>
          <span slot="title" v-else-if="newEngineOpened">New engine</span>
          <div v-if="newEngineOpened">
            <engine @create="engineCreated" :editable="newEngineOpened"></engine>
          </div>
          <div class="key-values" v-if="selectedSwap">
            <div class="key-value">
              <div class="key">Serial number</div>
              <div class="dash"></div>
              <div class="value">
                <div class="input-holder">
                  <span>{{ selectedSwap.serial_number }}</span>
                </div>
              </div>
            </div>
            <div class="key-value">
              <div class="key">Engine time at install</div>
              <div class="dash"></div>
              <div class="value">
                <div class="input-holder">
                  <span v-if="engineTimeEdit">{{ timeAtInstall }}</span>
                  <input type="number" v-else v-model="timeAtInstall">
                </div>
              </div>
            </div>
            <div class="key-value">
              <div class="key">Engine cycles at install</div>
              <div class="dash"></div>
              <div class="value">
                <div class="input-holder">
                  <span v-if="engineTimeEdit">{{ cyclesAtInstall }}</span>
                  <input type="number" v-else v-model="cyclesAtInstall">
                </div>
              </div>
            </div>
          </div>

        </group>
        <br>
        <group label="Comments" :error="$v.comments.$error">
          <text-field v-model="comments"></text-field>
          <div v-if="!$v.comments.required" slot="errors">
            Comments are required
          </div>
        </group>
      </div>
      <group>
        <el-button type="success" @click="saveSwap" :disabled="newEngineOpened || $v.$pending">
          Swap <span v-if="isRemoval">(Remove)</span>
        </el-button>
        <div v-if="newEngineOpened">Complete engine editing before saving swap</div>
      </group>
    </vertical-form>
  </block>
</template>

<style lang="scss" src="../../scss/engine.scss"></style>
<style lang="scss" src="../../scss/swap.scss"></style>
<style lang="scss">
  .switcher {
    margin: 10px 0;
    cursor: pointer;
  }
</style>
