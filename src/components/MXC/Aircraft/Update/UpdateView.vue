<script>
  import {mapGetters, mapState, mapActions} from 'vuex';
  import {
    mapFormFloatField,
    mapFormTextField,
    mapFormIntField,
    mapFormBooleanField
  } from 'store/helpers/forms';

  import WbPropsModal from '../../../WB/Inject/Modal.vue';
  import Selectize from "../../../fields/Selectize.vue";
  import Datepicker from "../../../fields/Datepicker.vue";
  import Block from "Common/Block.vue";
  import TextField from "Common/Form/Fields/TextField.vue";
  import NumberField from "Common/Form/Fields/NumberField.vue";
  import Errors from "Common/Form/Errors.vue";
  import VerticalForm from "Common/Form/VerticalForm.vue";
  import Group from "Common/Form/Group.vue";
  import GroupSplit from "Common/Form/GroupSplit.vue";
  import { UPDATE_AIRCRAFT } from "../../../../store/modules/aircraft/consts";
  import { required } from 'vuelidate/lib/validators';


  export default {
    props: ['id'],
    computed: {
      ...mapFormTextField("aircraft/aircraft", "aircraft/" + UPDATE_AIRCRAFT, [
        "serial",
        "registration",
        "yom",
        "date_purchased",
        "previous_mx",
        "next_mx",
      ]),
      ...mapFormFloatField("aircraft/aircraft", "aircraft/" + UPDATE_AIRCRAFT, [
        "base_hobbs",
        "base_aftt",
        "bew",
        "bew_cg"
      ]),
      ...mapFormBooleanField("aircraft/aircraft", "aircraft/" + UPDATE_AIRCRAFT, [
        "active",
        "show_fuel_on_board_aux",
        "show_wing_locker"
      ]),
      ...mapFormIntField("aircraft/aircraft", "aircraft/" + UPDATE_AIRCRAFT, [
        "base_airframe_landings",
        "base_manifest_number",
        "type",
        "number_seats",
        "engine_1",
        "engine_2"
      ]),
      ...mapState("aircraft", [
        "aircraftTypes",
        "aircraft"
      ]),
      ...mapGetters("aircraft", [
        "selectedAircraftType"
      ]),
      ...mapGetters("engine", [
        "engines",
        "activeEngines",
        "freeEngines",
      ]),
    },

    components: {
      TextField,
      NumberField,
      VerticalForm,
      GroupSplit,
      Datepicker,
      Group,
      Errors,
      Selectize,
      Block,
      WbPropsModal,
    },

    validations() {
      let base = {
        serial: {
          required
        },
        type: {required},
        registration: {required},
        base_hobbs: {required},
        yom: {required},
        date_purchased: {required},
        base_manifest_number: {required},
        base_airframe_landings: {required},
        base_aftt: {required},
        number_seats: {required},
        bew: {required},
        bew_cg: {required},
        previous_mx: {required},
        next_mx: {required},
      };
      if (!this.aircraft.id) {
        base = {
          ...base,
          engine_1: {required},
        };
        if (this.selectedAircraftType && this.selectedAircraftType.number_of_engines > 1) {
          base = {
            ...base,
            engine_2: {required},
          }
        }
      }
      return base;
    },
    methods: {
      ...mapActions("aircraft", [
        "getAircraft",
        "getAircrafts",
        "getAircraftTypes",
        "pushAircraft"
      ]),
      ...mapActions("engine", ["getEngines", "selectEngine"]),
      ...mapActions('wb/aircraft-params', ['setActiveAircraftId']),

      save() {
        this.$v.$touch();
        if (!this.$v.$error) {
          this.pushAircraft().then((data) => {
            this.getAircrafts();
            this.$router.push({name: 'mxc_dashboard'});
          });
        }
      },

      handleCustomizeWbClick() {
        const data = {
          aircraftId: this.aircraft.id,
          aircraftTypeId: this.aircraft.type,
        };

        this.setActiveAircraftId(data);
      },
    },
    validationMessages: {},
    mounted() {
      this.getAircraftTypes();
      this.getEngines();
      if (this.id) {
        this.getAircraft(this.id);
      }
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        // access to component instance via `vm`
      })
    },
    created() {
    }
  }
</script>

<template>
  <block :no-padding="true" v-loading="id && (!aircraft.id || aircraft.id !== id)">
    <div slot="title">
      <span v-if="!id">Aircraft creation</span>
      <span v-else="">{{registration}} edit</span>
    </div>
    <vertical-form>
      <group label="Is active?">
        <div class="switcher">
          <el-switch v-model="active" on-text="Yes" off-text="No"></el-switch>
        </div>
      </group>
      <group label="Aircraft Types" :validation-data="$v.type" v-loading="aircraftTypes.length === 0">
        <selectize :items="aircraftTypes" label="Aircraft type" :minimal="true" v-model="type" field="name">
        </selectize>
      </group>
      <group-split v-if="selectedAircraftType && !id">
        <group label="Engine 1" :validation-data="$v.engine_1">
          <el-select v-model="engine_1" v-if="freeEngines" filterable placeholder="Engine serial">
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
          </el-select>
        </group>
        <group label="Engine 2" v-if="selectedAircraftType.number_of_engines > 1" :validation-data="$v.engine_2">
          <el-select v-model="engine_2" v-if="freeEngines" filterable placeholder="Engine serial">
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
          </el-select>
        </group>
      </group-split>
      <group-split>
        <group label="Serial" :validation-data="$v.serial">
          <text-field v-model="serial"></text-field>
        </group>
        <group label="Registration" :validation-data="$v.registration">
          <text-field v-model="registration"></text-field>
        </group>
      </group-split>
      <group-split>
        <group label="Date of manufacture" :validation-data="$v.yom">
          <datepicker v-model="yom"></datepicker>
        </group>
        <group label="Date of purchased" :validation-data="$v.date_purchased">
          <datepicker v-model="date_purchased"></datepicker>
        </group>
      </group-split>
      <group-split :highlight="true">
        <group label="Base manifest #" :validation-data="$v.base_manifest_number">
          <number-field v-model="base_manifest_number"></number-field>
        </group>
        <group label="Base hobbs" :validation-data="$v.base_hobbs">
          <number-field v-model="base_hobbs"></number-field>
        </group>
        <group label="Base aircraft time" :validation-data="$v.base_aftt">
          <number-field v-model="base_aftt"></number-field>
        </group>
        <group label="Base landings" :validation-data="$v.base_airframe_landings">
          <number-field v-model="base_airframe_landings"></number-field>
        </group>
      </group-split>
      <group-split>
        <group label="Basic Empty Weight (Pounds)" :validation-data="$v.bew">
          <number-field v-model="bew"></number-field>
        </group>
        <group label="CG Basic Empty Weight (Pounds)" :validation-data="$v.bew_cg">
          <number-field v-model="bew_cg"></number-field>
        </group>
      </group-split>
      <group label="Number of seats" :validation-data="$v.number_seats">
        <number-field v-model="number_seats"></number-field>
      </group>
      <group-split>
        <group label="Previous MX" :validation-data="$v.previous_mx">
          <number-field step="0.1" v-model="previous_mx"></number-field>
        </group>
        <group label="Next MX" :validation-data="$v.next_mx">
          <number-field step="0.1" v-model="next_mx"></number-field>
        </group>
      </group-split>
      <group-split>
        <group>
          <div class="switcher">
            <el-switch v-model="show_fuel_on_board_aux" on-text="" off-text=""></el-switch>
            <span @click="show_fuel_on_board_aux=!show_fuel_on_board_aux">
              Show fuel on board aux <el-tag type="primary">W&B</el-tag>
            </span>
          </div>
        </group>
        <group>
          <div class="switcher">
            <el-switch v-model="show_wing_locker" on-text="" off-text=""></el-switch>
            <span @click="show_wing_locker=!show_wing_locker">
              Show wing locker <el-tag type="primary">W&B</el-tag>
            </span>
          </div>
        </group>
      </group-split>
      <group>
        <el-button type="success" @click="save">
          Save
        </el-button>
        <el-button type="primary" @click="handleCustomizeWbClick">
          Customize WB Stations
        </el-button>
      </group>
    </vertical-form>
    <wb-props-modal />
  </block>
</template>
<style>
  .switcher {
    cursor: pointer;
  }
</style>
