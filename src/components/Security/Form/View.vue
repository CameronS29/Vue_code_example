<script>
  import find from 'lodash/find';
  import filter from 'lodash/filter';
  import forEach from 'lodash/forEach';
  import { Form, Row, Col, Checkbox } from 'element-ui';
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import Collapse from 'Common/Collapse.vue';
  import Group from 'Common/Form/Group.vue';
  import TextField from 'Common/Form/Fields/TextField.vue';
  import ButtonEl from "Common/Button.vue";
  import { mapFormTextField, mapFormIntField } from "store/helpers/forms";
  import FlightView from './Partials/Flight.vue';
  import SearchDetailView from './Partials/SearchDetail.vue';
  import {required} from 'vuelidate/lib/validators';

  export default {
    components: {
      Collapse,
      Group,
      FlightView,
      ButtonEl,
      SearchDetailView,
      Checkbox,
      TextField,
      ElForm: Form,
      ElRow: Row,
      ElCol: Col,
    },

    computed: {
      ...mapGetters('security', [
        'reasons',
        'internalCheckList',
        'externalCheckList'
      ]),
      ...mapGetters('pilotManifest', [
        'availableProfiles',
        'availableAirports',
      ]),
      ...mapGetters('aircraft', [
        'aircrafts',
        'aircraftTypes'
      ]),
      ...mapGetters('security/form', [
        'form',
        'progress',
      ]),
      ...mapGetters('user', [
        'user',
      ]),
      ...mapGetters('user', [
        'isAdmin', 'isSecurity'
      ]),
      ...mapFormTextField("security/form/form", "security/form/UPDATE_FORM", [
        'initials',
        'pin',
      ]),
      ...mapFormIntField("security/form/form", "security/form/UPDATE_FORM", [
        'creator',
      ]),
      aircraftType() {
        console.log(this.form.aircraft);
        if (this.form.aircraft) {
          const aircraft = find(this.aircrafts, {id: this.form.aircraft});
          if (aircraft) {
            return aircraft.type.type;
          } else {
            return '';
          }

        }
        return '';
      },
      internalCheckItems() {
        if (this.aircraftType) {
          return filter(this.internalCheckList, c=>c.id.indexOf(this.aircraftType) > -1);
        } else {
          return [];
        }
      },
      externalCheckItems() {
        console.log(this.aircraftType);
        if (this.aircraftType) {
          return filter(this.externalCheckList, c=>c.id.indexOf(this.aircraftType) > -1);
        } else {
          return [];
        }
      },

    },

    methods: {
      ...mapActions('security/form', [
        'saveFormData',
      ]),
      ...mapActions('security', [
        'getSecurityOptions',
      ]),
       ...mapActions('pilotManifest', [
        'getAvailableProfiles',
        'getAvailableAirports',
      ]),
      ...mapActions('aircraft', [
        'getAircrafts',
        'getAircraftTypes',
      ]),
      handleSubmit() {
        this.creator = this.user.profile_id;
        this.$refs.externalSearch.$v.$touch();
        this.$refs.internalSearch.$v.$touch();
        this.$refs.flight.$v.$touch();
        this.$v.$touch();

        if (!this.$v.$invalid && !this.$refs.flight.$v.$invalid && !this.$refs.internalSearch.$v.$invalid &&  !this.$refs.externalSearch.$v.$invalid) {
          this.saveFormData()
            .then((res)=>{
              this.$notify({
                type: "success",
                title: 'Success',
                message: 'Successfully recorded'
              });
              this.confirmed = false;
              this.$v.$reset();

              if (this.isSecurity || this.isAdmin) {
                this.$router.push({name: 'security_dashboard'});
              } else {
                const { id } = res;
                this.$router.push({name: 'security_confirm', params: {id}});
              }
            })
            .catch((res)=>
              this.$notify({
                type: 'error',
                title: 'Error completing log',
                dangerouslyUseHTMLString: true,
                message: JSON.stringify(res.response.data)
              })
            );
        }

      }
    },
    created() {
      if (this.reasons.length == 0) {
        this.getSecurityOptions();
      }
      if (this.aircraftTypes.length == 0) {
        this.getAircraftTypes();
      }
      if (this.aircrafts.length == 0) {
        this.getAircrafts();
      }
      if (this.availableProfiles.length == 0) {
        this.getAvailableProfiles();
      }
      if (this.availableAirports.length == 0) {
        this.getAvailableAirports();
      }
    },
    data() {
      return {
        confirmed: false
      }
    },
    fieldErrors: {
      confirmError: vm => "Please confirm"
    },
    validations: {
      confirmed: {
        confirmError(val) {
          return val === true;
        }
      },
      pin: {required},
      initials: {required},
    }
  };
</script>

<template>
  <div class="securityForm">
    <div class="securityForm__notice">
      SENSITIVE SECURITY INFORMATION
      WARNING: THIS RECORD CONTAINS SENSITIVE SECURITY INFORMATION THAT IS CONTROLLED UNDER 49 C.F.R. PARTS 15 AND 1520. NO PART OF THIS RECORD MAY BE DISCLOSED TO PERSONS WITHOUT A "NEED TO KNOW," AS DEFINED IN 49 C.F.R. PARTS 15 AND 1520, EXCEPT WITH THE WRITTEN PERMISSION OF THE ADMINISTRATOR OF THE TRANSPORTATION SECURITY ADMINISTRATION OR THE SECRETARY OF TRANSPORTATION. UNAUTHORIZED RELEASE MAY RESULT IN CIVIL PENALTIES OR OTHER ACTION. FOR U.S. GOVERNMENT AGENCIES, PUBLIC DISCLOSURE GOVERNED BY 5 U.S.C. 552 AND 49 C.F.R. PARTS 15 AND 1520.
    </div>

    <collapse title="Flight Details">
      <flight-view ref="flight" />
    </collapse>

    <collapse :title="`Search details: Internal ${aircraftType}`">
      <search-detail-view field="internal_check" label="internal"
        :checkList="internalCheckItems" :aircraftType="aircraftType" ref="internalSearch" />
    </collapse>

    <collapse :title="`Search details: External ${aircraftType}`">
      <search-detail-view field="external_check" label="external"
        :checkList="externalCheckItems" :aircraftType="aircraftType" ref="externalSearch" />
    </collapse>
    <collapse :title="`Confirm`">
      <el-row :gutter="20">
        <el-col :span="24">
          <group :validation-data="$v.confirmed">
            <el-checkbox v-model="confirmed">
              By checking this box, you are verifying that all information collected on this form is true and accurate and that any issues have been noted for the {{aircraftType}}.
            </el-checkbox>
          </group>
        </el-col>
        <el-col :span="6">
          <group label="PIC Initials" :validation-data="$v.initials">
            <text-field v-model="initials" />
          </group>
        </el-col>
        <el-col :span="6">
          <group label="PIC PIN" :validation-data="$v.pin">
            <text-field v-model="pin" type="password"/>
          </group>
        </el-col>
        <el-col :span="4" :offset="1">
          <button-el class="btn-full-width securityForm__submit-btn" @click="handleSubmit">
            Submit
            <i class="fa fa-check" v-if="!progress"></i>
            <i class="fa fa-circle-o-notch fa-spin fa-1x fa-fw" v-else></i>
          </button-el>
        </el-col>
      </el-row>
    </collapse>

  </div>
</template>

<style lang="scss">
  .securityForm {
    padding: 25px;

    &__notice {
      border-radius: 8px;
      background: #fdf6ec;
      font-size: 15px;
      color: #d98f23;
      padding: 10px;
      margin-bottom: 15px;
    }
    &__submit-btn {
      margin-top: 23px;
    }
  }
</style>
