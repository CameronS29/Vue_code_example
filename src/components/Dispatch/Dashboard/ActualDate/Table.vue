<script>
  import {DateTime} from 'luxon';
  import { get } from 'lodash';
  import SortableTable from 'Common/SortableTable';

  export default {
    components: {
      SortableTable,
    },
    props: {
      history: {
        type: Boolean,
        default: false,
      },
      namespace: {
        type: String,
        required: true,
      },
    },
    methods: {
      approve(record) {
        this.$emit('approve', record);
      },
      isReviewed(log) {
        return (
          get(log, "out_in.reviewed", false) ||
          get(log, "diversion.reviewed", false) ||
          get(log, "diversion.airport", false)
        )
      },
      isOrigin(log) {
        return log.airport && log.airport.airport_type === 0;
      },
      isDestination(log) {
        return log.airport && log.airport.airport_type === 1;
      },
    },
  };
</script>

<template>
  <div>
    <sortable-table
      :searchable="history && 'search'"
      :namespace="namespace">
      <el-table-column
        sortable
        prop="datetime_type"
        width="100"
        label="OUT/IN">
        <template slot-scope="props">
          <el-tag v-if="props.row.out_in && props.row.out_in.datetime_type === 0" type="success">OUT</el-tag>
          <el-tag v-if="props.row.out_in && props.row.out_in.datetime_type === 1" type="warning">IN</el-tag>
          <el-tag v-if="props.row.diversion" type="danger">
            {{ props.row.diversion.diversion_type_verbose }}
          </el-tag>
          <el-tag v-if="isOrigin(props.row)" type="info">Origin</el-tag>
          <el-tag v-if="isDestination(props.row)" type="info">Dest.</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        width="90"
        label="Actions">
        <template slot-scope="props">
          <button
            v-if="!isReviewed(props.row)"
            class="btn btn-primary btn-xs"
            @click="approve(props.row)"
            title="Confirm log">
            <i class="fa fa-check"/>
          </button>
          <router-link
            class="btn btn-default btn-xs" title="View Log"
            :to="{ name: 'dispatch_log_edit', params: { id: props.row.flight.manifest_id, logId: props.row.flight.flightlog_id }}"
          >
            <i class="fa fa-eye"></i>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column
        sortable
        prop="log__flight__flight_number"
        width="100"
        label="Flight #">
        <template slot-scope="props">
          {{ props.row.flight.flight_number }}
        </template>
      </el-table-column>
      <el-table-column
        sortable
        min-width="165"
        prop="datetime_value"
        label="Date/Time (UTC)">
        <template slot-scope="props">
          <span v-if="props.row.out_in && props.row.out_in.datetime_value">
            {{ props.row.out_in.datetime_value | longDT }}
          </span>
          <span v-else-if="!!props.row.out_in">
            Deleted date
          </span>
        </template>
      </el-table-column>
      <el-table-column
        min-width="165"
        prop="local_datetime"
        label="Date/Time (local)">
        <template slot-scope="props">
          <span v-if="props.row.out_in && props.row.out_in.local_datetime">
            {{ props.row.out_in.local_datetime | longDTTimezone }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        sortable
        width="120"
        prop="log__flight__origin__iata"
        label="Departure">
        <template slot-scope="props">
          <span v-if="isOrigin(props.row)">
            {{ props.row.airport.airport_iata }} <i class="fa fa-refresh" aria-hidden="true"></i>
          </span>
          <span v-else>
            {{ props.row.flight.origin }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        sortable
        width="100"
        prop="log__flight__destination__iata"
        label="Arrival">
        <template slot-scope="props">
          <span v-if="isDestination(props.row)">
            {{ props.row.airport.airport_iata }} <i class="fa fa-refresh" aria-hidden="true"></i>
          </span>
          <span v-else>
            {{ props.row.flight.destination }}
          </span>
        </template>
      </el-table-column>
    </sortable-table>
  </div>
</template>

<style lang="scss">
.highlight-change {
  background: #0e9aef;
}
</style>
