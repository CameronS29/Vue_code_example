<script>
  import { mapActions } from 'vuex';
  import Card from 'Common/Card.vue';
  import { formatDateTime, formatTime } from '../../utils';

  export default {
    name: 'ReportTable',

    components: { Card },

    props: {
      title: String,
      data: {
        type: Array,
        default: () => ([]),
      },
    },

    methods: {
      ...mapActions('flights', ['fetchFlight']),

      dateFormat(_r, _c, cellValue) {
        return `${formatDateTime(cellValue)}Z`;
      },

      durationFormat(_r, _c, cellValue) {
        return formatTime(cellValue);
      },

      tableRowClassName({ row }) {
        const opType = row.type_of_operations__name;
        if (['Training', 'Reposition', 'Maintenance'].indexOf(opType) !== -1) {
          return '';
        }

        const delay = row.flightlog__delay__name;
        if (delay === '' || delay === null) {
          return 'warning-row';
        }
        return '';
      },

      handleFlightNumberClick(row) {
        this.fetchFlight(row.id);
      },
    },
  };
</script>

<template>
  <card :title="title">
    <el-table :data="data" :row-class-name="tableRowClassName" class="report__duty-table">
      <el-table-column prop="flight_number" label="Fl. No." fixed>
        <template slot-scope="scope">
          <a @click.prevent="handleFlightNumberClick(scope.row)">
            {{ scope.row.flight_number }}
          </a>
        </template>
      </el-table-column>
      <el-table-column prop="destination__iata" label="Dest." />
      <el-table-column prop="pic" label="PIC" min-width="120">
        <template slot-scope="scope">
          <a :href="`mailto:${scope.row.pic_mail}`">{{ scope.row.pic }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="sic" label="SIC" min-width="120">
        <template slot-scope="scope">
          <a :href="`mailto:${scope.row.sic_mail}`">{{ scope.row.sic }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="reporter" label="Reporter" min-width="120">
        <template slot-scope="scope">
          <a :href="`mailto:${scope.row.reporter_mail}`">{{ scope.row.reporter }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="flightlog__delay__name" label="Delay Reason" min-width="100" />
      <el-table-column prop="flightlog__comments" label="Comments" min-width="240" />
      <el-table-column prop="departure_delay" label="Departure Delay" :formatter="durationFormat" />
      <el-table-column prop="scheduled_departure" label="Scheduled Departure" :formatter="dateFormat" width="120" />
      <el-table-column prop="datetime_out" label="OUT" :formatter="dateFormat" width="120" />
      <el-table-column prop="datetime_off" label="OFF" :formatter="dateFormat" width="120" />
      <el-table-column prop="datetime_on" label="ON" :formatter="dateFormat" width="120" />
      <el-table-column prop="datetime_in" label="IN" :formatter="dateFormat" width="120" />
      <el-table-column prop="scheduled_arrival" label="Scheduled Arrival" :formatter="dateFormat" width="120" />
      <el-table-column prop="arrival_delay" label="Arrival Delay" :formatter="durationFormat" />
    </el-table>
  </card>
</template>

<style lang="scss">
  .report__duty-table {
    &.el-table .warning-row {
      background: oldlace;
    }

    &.el-table td,
    &.el-table th {
      font-size: 12px;
      padding: 0 5px;
    }

    &.el-table .cell {
      padding: 0;
    }
  }
</style>
