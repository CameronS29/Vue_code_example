<script>
  import {mapGetters, mapActions, mapMutations} from 'vuex';
  import {required} from 'vuelidate/lib/validators';
  import * as consts from "../../../../store/modules/aircraft/consts";
  import {greaterThan} from "../../../../validators/date";

  function engineProperty(field, mutation) {
    return {
      get() {
        return this.newEngine[field];
      },
      set(value) {
        this.$store.commit("engine/" + mutation, value);
      }
    }
  }

  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      editable: {
        type: Boolean,
        default: false,
      },
      id: {
        type: Number,
        default: null,
      },

    },
    created() {
      if (this.id) {
        this.getEngine(this.id);
      }
    },
    methods: {
      ...mapActions("engine", [
        "getEngine",
        "pushEngine",
      ]),
      ...mapMutations("engine", [
        consts.SET_NEW_ENGINE_OPENED
      ]),
      push() {
        this.$v.$touch();
        if (!this.$v.$invalid) {
          this.pushEngine((engine) => {
            this[consts.SET_NEW_ENGINE_OPENED](false);
            this.$emit("create", engine);
          });
        }
      },
    },
    computed: {
      ...mapGetters("engine", [
        "newEngine",
        "newEngineOpened"
      ]),
      manufacturer: engineProperty("manufacturer", consts.SET_ENGINE_MANUFACTURER),
      series: engineProperty("series", consts.SET_ENGINE_SERIES),
      type: engineProperty("type", consts.SET_ENGINE_TYPE),
      serialNumber: engineProperty("serial_number", consts.SET_SERIAL_NUMBER),
      baseEngineHours: engineProperty("base_engine_time", consts.SET_BASE_ENGINE_HOURS),
      baseEngineCycles: engineProperty("base_engine_cycles", consts.SET_BASE_ENGINE_CYCLES),
      baseTimeLastOverhaul: engineProperty("base_time_last_overhaul", consts.SET_BASE_ENGINE_LAST_OVERHAUL),
    },
    validations: {
      serialNumber: {
        required
      },
      baseEngineHours: {
        required
      },
      baseEngineCycles: {
        required
      },
    }
  }
</script>
<style lang="scss" src="../../scss/engine.scss"></style>
<template>
  <div v-if="newEngine"  v-loading.body="!newEngine.id && id">
    <el-alert v-if="$v.serialNumber.$error"
      title="Serial number is required"
      type="error"
      show-icon>
    </el-alert>
    <el-alert v-if="$v.baseEngineHours.$error"
      title="Engine time at install hours value is required"
      type="error"
      show-icon>
    </el-alert>
    <el-alert v-if="$v.baseEngineCycles.$error"
      title="Engine cycles at install hours value is required"
      type="error"
      show-icon>
    </el-alert>
    <div class="key-values">
      <div class="key-value">
        <div class="key">Serial number</div>
        <div class="dash"></div>
        <div class="value">
          <div class="input-holder">
            <input id="serial_number" v-model="serialNumber" v-if="editable">
            <span v-else>{{ serialNumber }}</span>
          </div>
        </div>
      </div>
      <div class="key-value">
        <div class="key">Engine time at install</div>
        <div class="dash"></div>
        <div class="value">
          <div class="input-holder" id="base_engine_time">
            <input type="number" v-model.number="baseEngineHours" v-if="editable">
            <span v-else>{{ baseEngineHours }} </span>
          </div>
        </div>
      </div>
      <div class="key-value">
        <div class="key">Engine cycles at install</div>
        <div class="dash"></div>
        <div class="value">
          <div class="input-holder">
            <input type="number" id="base_engine_hours" v-model.number="baseEngineCycles" v-if="editable">
            <span v-else>{{ baseEngineCycles }} </span>
          </div>
        </div>
      </div>
    </div>

    <div class="engine-buttons" v-if="editable">
      <button class="btn btn-success" @click="push">Save Engine</button>
    </div>
  </div>
</template>
<style>
  .el-alert {
    margin-bottom: 10px;
  }
</style>
