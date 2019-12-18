<script>
  import { DateTime } from 'luxon';
  import { mapActions } from 'vuex';

  import Card from 'Common/Card.vue';
  import RecordsTable from '../Common/RecordsTable.vue';
  import FlightDetails from '../../Flight/Status/FlightDetails.vue';

  export default {
    name: 'FlightLogClicks',
    components: { FlightDetails, RecordsTable, Card },
    methods: {
      ...mapActions('flights', ['fetchFlight']),

      formatTime(_r, _c, cellValue) {
        return DateTime.fromISO(cellValue, { setZone: true })
          .toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
      },

      capitalize(_r, _c, cellValue) {
        return cellValue.toUpperCase();
      },

      handleFlightNumberClick(row) {
        this.fetchFlight(row.event.flight);
      },
    },
  };
</script>

<template>
  <card title="OUT/IN Clicks (UTC)">
    <records-table namespace="tracking/tables/fl-click" prefix="oi" :filters="{type: 'click.fl-fill'}">
      <el-table-column label="Fl. No." width="65">
        <template slot-scope="scope">
          <a href="#" @click.prevent="handleFlightNumberClick(scope.row)">
            {{ scope.row.event.flight_number }}
          </a>
        </template>
      </el-table-column>

      <el-table-column label="OUT/IN" prop="event.time" :formatter="capitalize" width="80" />
      <el-table-column label="By" prop="user.full_name" />
      <el-table-column label="Triggered At" prop="triggered_at" sortable :formatter="formatTime" />
      <el-table-column label="Recorded At" prop="recorded_at" sortable :formatter="formatTime" />
    </records-table>
    <flight-details />
  </card>
</template>
