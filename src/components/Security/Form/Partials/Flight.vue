<script>
  import find from 'lodash/find';
  import { DateTime } from 'luxon';
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import { Row, Col } from 'element-ui';
  import ButtonEl from "Common/Button.vue";
  import Group from "Common/Form/Group.vue";
  import GroupSplit from "Common/Form/GroupSplit.vue";
  import SelectField from "../../../fields/Selectize.vue";
  import { mapFormIntField } from "../../../../store/helpers/forms";
  import PickFlight from "../../../FlightLog/ManifestView/Update/PickFlight/Modal.vue";
  import { UPDATE_FORM } from '../../../../store/modules/security/consts';
  import {required} from 'vuelidate/lib/validators';

  export default {
    components: {
      ElRow: Row,
      ElCol: Col,
      Group,
      SelectField,
      PickFlight,
      ButtonEl
    },

    computed: {
      ...mapGetters('wb',
        {
          wbLog: 'log',
          wbPICs: 'availablePICPilots',
          wbSICs: 'availableSICPilots',
        }
      ),
      ...mapGetters('security', [
        'reasons',
      ]),
      ...mapGetters('security/form', [
        'form',
      ]),
      ...mapGetters('aircraft', [
        'aircrafts',
        'aircraftTypes'
      ]),
      ...mapGetters('pilotManifest', [
        'availablePICPilots',
        'availableSICPilots',
      ]),
      ...mapGetters('pilotManifest/flights', {
        flights: 'results',
      }
      ),
      ...mapGetters('user', [
        'user',
      ]),
      ...mapFormIntField("security/form/form", "security/form/UPDATE_FORM", [
        'reason_for_search',
        'pic',
        'sic',
        'aircraft'
      ]),
      picEmpNumber() {
        console.log(this.pic);
        const profile = find(this.availablePICPilots, {id: this.pic});
        console.log(profile);
        return profile && profile.employee_number;
      },
      sicEmpNumber() {
        const profile = find(this.availableSICPilots, {id: this.sic});
        return profile && profile.employee_number;
      },
      results() {
        let flights = this.flights;
        if (this.$route.query.fromWB) {
          flights.push({id: this.wbLog.flight, ...this.wbLog.flight_data});
        }
        return flights;
      },
      flightInfo() {
        return find(this.results, {id: this.form.flight});
      },

      flightNumber() {
        if (this.flightInfo) {
          return this.flightInfo.flight_number;
        }
      },
    },
    methods: {
      ...mapActions('pilotManifest/pickFlight', [
        'setFilterData',
        'reset',
      ]),
       ...mapMutations('security/form', [
        UPDATE_FORM,
      ]),
      showPickModal() {
        const todayStr = new DateTime({}).toFormat('MM/dd/yyyy');
        console.log(todayStr);
        this.setFilterData({date: todayStr});
      },
      flightPicked(flightId) {
        const pickedFlight = find(this.results, {id: flightId});
        const departureTime = DateTime.fromISO(pickedFlight.scheduled_departure, { zone: 'utc'});
        const hours = departureTime.diff(DateTime.utc(), ['hours']).hours;

        if (hours > 2) {
          this.$notify({
            type: 'error',
            title: 'You can not select this flight.',
            message: 'The security form can only be filled out within 2 hours of the scheduled flight time. If you have any questions email Security security@boutiqueair.com'
          });
          this[UPDATE_FORM]({flight: null});
        } else {
          this[UPDATE_FORM]({flight: flightId});
        }
        this.reset();
      }
    },
    validations: {
      reason_for_search: {required},
      pic: {required},
      aircraft: {required},
      flightNumber: {required},
    },
    mounted() {
      if (this.$route.query.fromWB && this.wbLog) {
        this.pic = (find(this.wbPICs, {id: this.wbLog.pic}) || {}).profile_id;
        this.sic = (find(this.wbSICs, {id: this.wbLog.sic}) || {}).profile_id;
        this.aircraft = this.wbLog.aircraft;
        this.flightPicked(this.wbLog.flight);
      } else if (this.user.is_pic) {
        this.pic = this.user.profile_id;
      }
    }
  };
</script>


<template>
  <div>
    <pick-flight :showUnscheduled="false" :securityPick="true" :createLog="false" @flight:picked="flightPicked" />
    <el-row>
      <el-col :sm="12" :md="6">
        <group label="Reason for search" :validation-data="$v.reason_for_search">
          <select-field v-model="reason_for_search" :items="reasons"
            :minimal="true" field="label" id-field="id" label="Reason" />
        </group>
      </el-col>
      <el-col :sm="12" :md="6">
        <group label="Flight Number" :validation-data="$v.flightNumber">
          <strong>{{ flightNumber }}&nbsp;&nbsp;</strong>
          <button-el
            label="Select Flight"
            @click="showPickModal"
            type="success" />
        </group>
      </el-col>
      <el-col :sm="12" :md="6">
        <group label="Scheduled departure time">
          <strong v-if="flightInfo">{{ flightInfo.scheduled_departure|longDT }} UTC</strong>
        </group>
      </el-col>
      <el-col :sm="12" :md="6">
        <group label="Tail number" :validation-data="$v.aircraft">
          <select-field v-model="aircraft" :items="aircrafts"
            :minimal="true" field="registration" label="Aircraft" />
        </group>
      </el-col>
    </el-row>
    <el-row>
      <el-col :sm="12" :md="6">
        <group label="PIC" :validation-data="$v.pic">
          <select-field v-model="pic" :items="availablePICPilots"
            :minimal="true" field="name" label="PIC" />
        </group>
      </el-col>
      <el-col :sm="12" :md="6">
        <group label="PIC Employee Number">
          <strong>{{ picEmpNumber }}</strong>
        </group>
      </el-col>
      <el-col :sm="12" :md="6">
        <group label="SIC">
          <select-field v-model="sic" :items="availableSICPilots"
            :minimal="true" field="name" label="SIC" />
        </group>
      </el-col>
      <el-col :sm="12" :md="6">
        <group label="SIC Employee Number">
          <strong>{{ sicEmpNumber }}</strong>
        </group>
      </el-col>
    </el-row>
  </div>
</template>
