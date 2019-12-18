<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import { mapFormTextField, mapFormDateField} from '../../../../../store/helpers/forms';
  import {Row, Col} from 'element-ui';
  import SelectField from "../../../../fields/Selectize.vue";
  import DatePicker from "../../../../fields/Datepicker.vue";
  import Group from "Common/Form/Group.vue";
  import Collapse from 'Common/Collapse.vue';

  export default {
    components: {
      SelectField,
      DatePicker,
      Group,
      Collapse,
      ElRow: Row,
      ElCol: Col,
    },
    computed: {
      ...mapGetters('pilotManifest', ['availableAirports']),
      ...mapFormTextField("pilotManifest/pickFlight/filterData", "pilotManifest/pickFlight/UPDATE_FLITHGT_FILTER", [
        "origin",
        "destination",
        "date",
      ]),
    }
  };
</script>
<template>
  <collapse title="Filter" :gutterColor="false">
    <el-row :gutter="15">
      <el-col :xs="24" :sm="8">
        <group label="Date">
          <date-picker v-model="date" />
        </group>
      </el-col>
      <el-col :xs="24" :sm="8">
        <group label="Origin" v-loading="availableAirports.length === 0">
          <select-field :items="availableAirports" :minimal="true" v-model="origin" field="iata" label="Origin" />
        </group>
      </el-col>
      <el-col :xs="24" :sm="8">
        <group label="Destination" v-loading="availableAirports.length === 0">
          <select-field :items="AUTH_USER_MODEL" :minimal="true" v-model="destination" field="iata" label="Destination" />
        </group>
      </el-col>
    </el-row>
  </collapse>
</template>
