<script>
  import {mapGetters, mapActions} from 'vuex';
  import {Row, Col} from 'element-ui';
  import Collapse from '../../../../Common/Collapse.vue';
  import Group from "Common/Form/Group.vue";
  import Selectize from '../../../../fields/Selectize.vue';
  import updateMixin, { logProperty, toNumber } from '../updateMixin';
  import {required} from 'vuelidate/lib/validators';
  export default {
    mixins: [updateMixin],
    components: {
      Collapse,
      Group,
      Selectize,
      ElRow: Row,
      ElCol: Col
    },
    computed: {
      ...mapGetters('pilotManifest', [
        'availablePilots',
      ]),
      reporting_profile_id: logProperty('reporting_profile_id', toNumber),
      isFlightLogOpen() {
        return this.flightlog.open;
      },
    },
    validations: {
      reporting_profile_id: {required},
    },
  };
</script>

<template>
  <collapse title="CREW INFORMATION" :gutterColor="false" class="flight-log-edit-crew">
    <el-row :gutter="30" class="flight-log-edit-crew__row">
      <el-col :md="6" :sm="12" :xs="24" class="flight-log-edit-crew__col">
        <group label="PIC">
          {{ flightlog.manifest.pic_name }}
        </group>
      </el-col>
      <el-col :md="6" :sm="12" :xs="24" class="flight-log-edit-crew__col">
        <group label="SIC">
          {{ flightlog.manifest.sic_name }}
        </group>
      </el-col>
      <el-col :md="6" :sm="12" :xs="24" class="flight-log-edit-crew__col">
        <group label="Number of Pilots">
          {{ flightlog.manifest.number_of_pilots }}
        </group>
      </el-col>
      <el-col :md="6" :sm="12" :xs="24" class="flight-log-edit-crew__col">
        <group label="Reporting Pilot"
          v-loading="availablePilots.length === 0"
          :validation-data="$v.reporting_profile_id">
          <selectize v-if="isFlightLogOpen" label="pilot" :items="availablePilots" :minimal="true"
            v-model="reporting_profile_id" field="name"/>
          <div v-else>{{flightlog.reporting_profile}}</div>
        </group>
      </el-col>
    </el-row>
  </collapse>
</template>

<style lang="scss">
  .flight-log-edit-crew {
    &__row {
      margin-bottom: -10px;
    }
    &__col {
      margin-bottom: 10px;
    }
  }
</style>
