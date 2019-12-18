<script>
  import {mapGetters, mapActions} from 'vuex';
  import { DateTime } from 'luxon';
  import Collapse from '../../../../Common/Collapse.vue';
  import moment from 'moment';
  import prettyMs from 'ms';

  export default {
    computed: {
      ...mapGetters('pilotManifest', [
        'manifest',
        'picDuty',
        'sicDuty',
      ]),
    },

    components: {
      Collapse
    },

    filters: {
      totalDuration: (dtStr1, dtStr2) => {
        if (dtStr1 && dtStr2) {
          let { minutes } = DateTime.fromISO(dtStr2).diff(DateTime.fromISO(dtStr1), 'minutes');
          minutes = Math.floor(minutes);
          return `${Math.floor(minutes / 60)}:${minutes % 60}`;
        }
      }
    }
  };
</script>

<template>
  <div class="row">
    <div class="col-lg-6 col-xs-12">
      <collapse title="General Info" :gutterColor="false">
        <div class="row">
            <div class="col-lg-4 col-sm-12">
                <p><label>Date: </label> {{ manifest.created_on }}</p>
            </div>
            <div class="col-lg-4 col-sm-12">
                <p><label>PIC: </label> {{ manifest.pic_name }}</p>
            </div>
            <div class="col-lg-4 col-sm-12">
                <p><label>SIC: </label> {{ manifest.sic_name }}</p>
            </div>
        </div>
      </collapse>

      <collapse title="Flight Info" :gutterColor="false">
        <div class="row">
          <div class="col-lg-4 col-sm-12">
              <p><label>Type of ops: </label> {{ manifest.op_type_name }}</p>
          </div>
          <div class="col-lg-4 col-sm-12">
              <p><label>Aircraft tail #: </label> {{ manifest.tail_number }}</p>
          </div>
          <div class="col-lg-4 col-sm-12">
              <p><label>Type and serial: </label> {{ manifest.aircraft_type }}</p>
          </div>
          <div class="col-lg-12">
            <p>
                <label>Notes:</label>
                {{ manifest.notes }}
            </p>
          </div>
        </div>
      </collapse>
    </div>

    <div class="col-lg-6 col-xs-12">
        <collapse title="Duty Time" :gutterColor="false">
          <div class="row">
              <div class="col-lg-4 col-xs-12">
                  <p><label>PIC ON (LOCAL BASE TIME): </label> {{ picDuty.duty_on_local|longDT }}</p>
              </div>
              <div class="col-lg-4 col-xs-12">
                  <p><label>PIC OFF (LOCAL BASE TIME): </label> {{ picDuty.duty_off_local|longDT  }}</p>
              </div>
              <div class="col-lg-4 col-xs-12">
                  <p>
                    <label>TOTALS: </label>
                    {{ picDuty.duty_on|totalDuration(picDuty.duty_off) }}
                  </p>
              </div>
          </div>
          <div class="row" v-if="manifest.sic_profile">
              <div class="col-lg-4 col-xs-12">
                  <p><label>SIC ON (LOCAL BASE TIME): </label> {{ sicDuty.duty_on_local|longDT  }}</p>
              </div>
              <div class="col-lg-4 col-xs-12">
                  <p><label>SIC OFF (LOCAL BASE TIME): </label> {{ sicDuty.duty_off_local|longDT  }}</p>
              </div>
              <div class="col-lg-4 col-xs-12">
                  <p>
                    <label>TOTALS: </label>
                    {{ sicDuty.duty_on|totalDuration(sicDuty.duty_off) }}
                  </p>
              </div>
          </div>
        </collapse>
    </div>
  </div>
</template>
