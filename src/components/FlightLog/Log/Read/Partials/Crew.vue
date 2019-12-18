<script>
  import { mapGetters, mapActions } from 'vuex';
  import Collapse from '../../../../Common/Collapse.vue';

  export default {
    computed: {
      ...mapGetters('flightlog', [
        'flightlog'
      ]),
    },
    components: {
      Collapse
    }
  };
</script>

<template>
  <collapse title="CREW INFORMATION" class="log-view-crew" :gutterColor="false">
    <div class="log-view-crew__row">
      <div class="form-group">
        <label>PIC</label>
        <p>{{ flightlog.manifest.pic_name }}</p>
      </div>
      <div class="form-group">
        <label>SIC</label>
        <p>{{ flightlog.manifest.sic_name }}</p>
      </div>

      <div class="form-group">
        <label>Number of Pilots</label>
        <p>
          {{ flightlog.manifest.number_of_pilots }}
        </p>
      </div>

      <div class="form-group">
        <label>Name of reporting pilot</label>
        <p>
          {{ flightlog.reporting_profile }}
        </p>
      </div>
    </div>
  </collapse>
</template>
