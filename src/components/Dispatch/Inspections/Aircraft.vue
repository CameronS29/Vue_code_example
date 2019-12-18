<script>
  import { mapState, mapActions } from 'vuex';
  import { DateTime } from 'luxon';
  import ManualSync from './Partials/ManualSync.vue';
  import ManualPush from './Partials/ManualPush.vue';
  import DiffPopup from './Partials/DiffPopup.vue';

  export default {
    computed: {
      ...mapState('inspections/aircrafts', [
        'aircrafts',
      ]),
    },
    methods: {
      ...mapActions('inspections/aircrafts', [
        'getInspections',
      ]),
      formatTime(date) {
        return DateTime.fromISO(date, { setZone: true }).toFormat('yyyy-MM-dd HH:mm');
      },
      formatDate(date) {
        return DateTime.fromISO(date, { setZone: true }).toFormat('MM/dd/yyyy');
      },
    },
    components: {
      ManualSync,
      ManualPush,
      DiffPopup,
    },
    created() {
      this.getInspections();
    },
  };
</script>

<template>
  <div>
    <el-table :data='aircrafts' border>
      <el-table-column prop='registration'
                       label="Tail #"
                       fixed
                       sortable
                       min-width="130" />
      <el-table-column prop="next_due_hours"
                       label="Next inspections due AFTT"
                       sortable
                       min-width="130" />
      <el-table-column prop="aftt"
                       label="Current AFTT"
                       min-width="130"
                       sortable />
      <el-table-column prop="next_due_hours_hobbs"
                       label="Next inspections due AFTT Hobbs"
                       sortable
                       min-width="130" />
      <el-table-column prop="hobbs"
                       label="Current Hobbs"
                       min-width="140"
                       sortable />
      <el-table-column prop="delta_due"
                       label="Hours remaining"
                       min-width="130"
                       sortable />
      <el-table-column prop="due_expired_count"
                       label="Number of past due items"
                       min-width="130"
                       sortable />
      <el-table-column label="Latest log">
        <el-table-column prop="latest_log.flight.destination"
                         label="Airport"
                         min-width="130"
                         sortable />
        <el-table-column prop="latest_log.flight.flight_number"
                         label="Flight number"
                         min-width="145"
                         sortable />
        <el-table-column
          label="Date/time"
          width="170"
          sortable>
          <template slot-scope="scope">
            <span v-if="scope.row.latest_log">
              {{ formatTime(scope.row.latest_log.actual_datetime_out) }}
            </span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column prop="mel_due_times_count"
                       label="Total number of MELs"
                       width="135"
                       sortable />
      <el-table-column
        width="160"
        label="Date of next MEL due"
        sortable>
        <template slot-scope="scope">
          <span v-if="scope.row.next_due_date">
            {{ formatDate(scope.row.next_due_date) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="airframe_landings"
                       label="Current landings"
                       width="135"
                       sortable />
      <el-table-column label="Engine 1"
                       width="135"
                       sortable>
        <el-table-column prop="engine_1.engine_time"
                         label="Time"
                         width="95"
                         sortable />
        <el-table-column prop="engine_1.engine_cycles"
                         label="Cycles"
                         width="95"
                         sortable />
      </el-table-column>
      <el-table-column label="Engine 2"
                       width="235"
                       sortable>
        <el-table-column prop="engine_2.engine_time"
                         label="Time"
                         width="95"
                         sortable />
        <el-table-column prop="engine_2.engine_cycles"
                         label="Cycles"
                         width="95"
                         sortable />
      </el-table-column>
      <el-table-column fixed="right" width="170">
        <template slot-scope="scope">
          <manual-sync :aircraft="scope.row.id" @done="getInspections" />
          <manual-push :aircraft="scope.row.id" @done="getInspections" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
