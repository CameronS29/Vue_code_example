<script>
  import {mapGetters, mapActions} from 'vuex';
  import Collapse from '../../../../Common/Collapse.vue';

  export default {
    data() {
      return {
        loaded: false
      };
    },
    computed: {
      ...mapGetters('pilotManifest', [
        'manifest'
      ]),
      ...mapGetters('manifest', ['aircraft']),
      aircraftId() {
        return this.manifest.aircraft
      },
      cls() {
        const { manifest } = this

        if (manifest.due_delta > 30) {
          return 'green'
        } else if (manifest.due_delta > 15) {
          return 'yellow'
        } else if (manifest.due_delta > 8) {
          return 'light-orange'
        } else if (manifest.due_delta > 0) {
          return 'bright-orange'
        } else {
          return 'red';
        }
      }
    },
    watch: {
      aircraftId() {
        this.fetchAircraft()
      }
    },
    created() {
      this.fetchAircraft()
    },
    components: {
      Collapse,
    },
    methods: {
      ...mapActions('manifest', [
        'getAircraftData'
      ]),
      fetchAircraft() {
        this.loaded = false;
        this.getAircraftData(this.aircraftId).finally(()=>this.loaded=true)
      }
    },
    filters: {
      defaultVal(val, dtVal) {
        return val ? val : dtVal;
      }
    },
  };
</script>

<template>
  <collapse title="Inspections" :gutterColor="false" v-loading="!loaded">
    <div class="inspection-table">
      <div class="table-content">
        <table class="inspection-value table-bordered table">
          <thead>
          <tr>
            <th class="empty"></th>
            <th>Current</th>
            <th>Next due</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td class="filled-td">AFTT</td>
            <td>{{ manifest.current_aftt|defaultVal(aircraft.aftt) }}</td>
            <td>{{ aircraft.next_due_hours|defaultVal('--') }}</td>
          </tr>
          <tr>
            <td class="filled-td">Hobbs</td>
            <td>{{ manifest.final_hobbs|defaultVal(aircraft.hobbs) }}</td>
            <td>{{ manifest.due_hobbs|defaultVal(aircraft.next_due_hours)|defaultVal('--') }}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="inspection-indicator">
        <div class="inspection-label">
          Hours left until next inspection is due
        </div>
        <div :class="['inspection-value',cls]">
          {{ manifest.due_delta|defaultVal("Not available") }}
        </div>
      </div>
    </div>
  </collapse>
</template>
