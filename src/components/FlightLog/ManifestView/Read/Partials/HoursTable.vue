<script>
  import {mapGetters, mapActions} from 'vuex';
  import Collapse from '../../../../Common/Collapse.vue';
  import HorizontalScrollable from 'Common/HorizontalScrollable.vue';

  export default {
    computed: {
      ...mapGetters('pilotManifest', [
        'manifest'
      ]),
      forwarded() {
        return this.manifest.forwarded
      }
    },

    components: {
      Collapse,
      HorizontalScrollable,
    },
    filters: {
      defaultVal(val, dtVal) {
        return val ? val : dtVal;
      }
    }
  };
</script>

<template>
  <collapse title="Hours" :gutterColor="false">
    <horizontal-scrollable>
      <table class="table table-striped table-bordered hours-table">
        <thead>
        <tr>
          <th rowspan="2" class="text-center"></th>
          <th rowspan="2" class="text-center">Hobbs</th>
          <th rowspan="2" class="text-center">Airframe landings</th>
          <th colspan="2" class="text-center">
            {{ manifest.has_single_engine ? "Single Engine" : "Left Engine" }}
          </th>
          <th colspan="2" class="text-center"
              v-if="!manifest.has_single_engine">Right Engine
          </th>
        </tr>
        <tr>
          <th class="text-center">Hours</th>
          <th class="text-center">Cycles</th>
          <th class="text-center" v-if="!manifest.has_single_engine">Hours</th>
          <th class="text-center" v-if="!manifest.has_single_engine">Cycles</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>Forwarded</td>
          <td>{{ forwarded.final_hobbs }}</td>
          <td>{{ forwarded.airframe_landings }}</td>
          <td>{{ forwarded.left_or_single_engine_hours }}</td>
          <td>{{ forwarded.left_or_single_engine_cycles }}</td>
          <td v-if="!manifest.has_single_engine">{{ forwarded.right_engine_hours }}</td>
          <td v-if="!manifest.has_single_engine">{{ forwarded.right_engine_cycles }}</td>
        </tr>
        <tr>
          <td>Manifest Total</td>
          <td>{{ manifest.manifest_total.hours }}</td>
          <td>{{ manifest.manifest_total.airframe_landings }}</td>
          <td>{{ manifest.manifest_total.hours }}</td>
          <td>{{ manifest.left_or_single_engine_cycles - forwarded.left_or_single_engine_cycles }}</td>
          <td v-if="!manifest.has_single_engine">{{ manifest.manifest_total.hours }}</td>
          <td v-if="!manifest.has_single_engine">
            {{ manifest.left_or_single_engine_cycles - forwarded.left_or_single_engine_cycles }}
          </td>
        </tr>
        </tbody>
        <tfoot>
        <tr>
          <td>Total</td>
          <td>{{ manifest.final_hobbs|defaultVal('0') }}</td>
          <td>{{ manifest.airframe_landings|defaultVal("--") }}</td>
          <td>{{ manifest.left_or_single_engine_hours|defaultVal("--") }}</td>
          <td>{{ manifest.left_or_single_engine_cycles|defaultVal("--") }}</td>
          <td v-if="!manifest.has_single_engine">{{ manifest.right_engine_hours|defaultVal("--") }}</td>
          <td v-if="!manifest.has_single_engine">{{ manifest.right_engine_cycles|defaultVal("--") }}</td>
        </tr>
        </tfoot>
      </table>
    </horizontal-scrollable>
  </collapse>
</template>

<style lang="scss">
  .hours-table {
    &__wrapper {
      overflow: auto;
    }
  }
</style>
