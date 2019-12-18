<script>
  import find from 'lodash/find';
  import debounce from 'lodash/debounce';
  import { DateTime } from 'luxon';
  import updateManifestMixin, { logProperty, toNumber } from './updateManifestMixin';
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import { UPDATE_MANIFEST, UPDATE_DUTY } from 'store/modules/pilotManifest/consts';
  import { Alert } from 'element-ui';
  import DateTimeInput from '../../../../fields/DatetimeInput.vue';
  import Group from "Common/Form/Group.vue";
  import {required, requiredIf} from 'vuelidate/lib/validators';

  export default {
    mixins: [updateManifestMixin],
    props: {
      field: String,
      duty: Object,
      profileField: String,
      labelFull: String,
      profileLabel: String,
      labelShort: String,
      baseField: String,
    },
    components: {
      Group,
      DateTimeInput,
      Alert
    },
    computed: {
      ...mapGetters('pilotManifest', [
        'allProfiles',
        'bases',
        'duties',
        'availableAirports'
      ]),
      dt_utc_val: {
        get() {
          return this.duty && this.duty[this.field];
        },
        set(value) {
          this[UPDATE_DUTY]({id: this.duty.id, [this.field]: value});
          this.saveDuty();
        }
      },
      dt_utc_str() {
        return this.dt_utc_val ? DateTime.fromISO(this.dt_utc_val, {zone: 'utc'}).toFormat("MM/dd/yyyy HH:mm") : '';
      },
      profileId() {
        return this.manifest[this.profileField] || false;
      },
      airport() {
        return find(this.availableAirports, {id: this.duty.base_airport}) || {};
      },
      dt_local_str: {
        get() {
          return this.dt_local_obj ?
            this.dt_local_obj
              .setZone('utc', {keepLocalTime: true})
              .toISO({suppressMilliseconds: true})
            : '';
        },
        set(newVal) {
          const tz = this.airport.tz;
          const original = DateTime.fromISO(newVal, {zone: 'utc'});
          let dt = original.setZone(tz, {keepLocalTime: true});
          if (dt.hour != original.hour) {
            dt = dt.set({hour: original.hour});
          }
          dt = dt
            .setZone('utc')
            .set({second: 0, millisecond: 0})
            .toISO({suppressMilliseconds: true});

          if (dt !== this.dt_utc_val) {
            this.dt_utc_val = dt;
          }
        }
      },
      dt_local_obj() {
        if (this.airport && this.dt_utc_val) {
          const tz = this.airport.tz;
          return DateTime.fromISO(this.dt_utc_val, {zone: 'utc'}).setZone(tz);
        } else {
          return null;
        }
      },
      baseTZ() {
        return this.dt_local_obj ? this.dt_local_obj.offsetNameShort : '';
      },
      dutyLength() {
        if (this.labelShort == 'ON' || !this.dt_utc_val) {
          return 0;
        }

        let onVal = this.duties[this.manifest.pic_duty].duty_on;
        if (this.profileField == 'sic_duty') {
          onVal = this.duties[this.manifest.sic_duty].duty_on;
        }
        const offDate = DateTime.fromISO(this.dt_utc_val, {zone: 'utc'});
        const onDate = DateTime.fromISO(onVal, {zone: 'utc'});
        return offDate.diff(onDate, 'hours').hours;
      },

    },
    methods: {
      ...mapMutations('pilotManifest', [
        UPDATE_MANIFEST,
        UPDATE_DUTY,
      ]),
      ...mapActions('pilotManifest', [
        'patchDuty'
      ]),
      saveDuty: debounce(function() {
        return this.patchDuty(this.duty);
      }, 800),
    },
    fieldErrors: {
      isGreaterThanOn: (vm) => {
        return `It should be greater than ${vm.profileLabel} Duty ON Time`;
      },
    },
    validations: {
      dt_utc_val: {
        required(val) {
          return !this.validateTryCount || !this.profileId || (val ? true : false);
        },
        isGreaterThanOn(offVal) {
          if (this.labelShort == "OFF" && offVal) {
            let onVal = this.duties[this.manifest.pic_duty].duty_on;
            if (this.profileField == 'sic_profile') {
              onVal = this.duties[this.manifest.sic_duty].duty_on;
            }

            if (onVal) {
              return onVal < offVal;
            }
          }

          return true;
        },
      },
    },
    validationMessages: {},
    watch: {
      profileId(val) {
        if (val) {
          const profile = find(this.allProfiles, {id: val});
          this[UPDATE_DUTY]({id: this.duty.id, base_airport: profile.base_airport.id});
        } else {
          this[UPDATE_DUTY]({id: this.duty.id, base_airport: null});
        }
      },
    },
  };
</script>

<template>
  <group :label="labelFull" :validation-data="$v.dt_utc_val" v-loading="!duty || duty.progress">
    <div v-if="duty">
      <date-time-input v-model="dt_local_str" :disabled="!airport" />
      <span v-if="airport">
        <strong>{{ profileLabel }} Base:</strong> {{ airport.iata }}&nbsp;&nbsp;
        <strong>{{ profileLabel }} Base TZ:</strong> {{ baseTZ }}&nbsp;&nbsp;
        <strong>{{ profileLabel }} {{ labelShort }}(UTC):</strong> {{ dt_utc_str }}
      </span>
    </div>
    <el-alert v-if="dutyLength > 16" show-icon type="warning" title="Duty hours exceeds 16" />
    <el-alert v-if="dutyLength < 0" show-icon type="warning" title="Duty off time should be greater than on time" />
  </group>
</template>

