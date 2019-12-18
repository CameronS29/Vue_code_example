<script>
  import { mapActions, mapGetters } from 'vuex';
  import { pickBy } from 'lodash';
  import { DatePicker, Button, Checkbox } from 'element-ui';
  import qs from 'query-string';

  import format from 'date-fns/format';
  import parse from 'date-fns/parse';
  import isValid from 'date-fns/isValid';

  import Badge from 'Common/Badge.vue';
  import SortableTable, { tableMixin } from 'Common/SortableTable';

  import Selectize from '../fields/Selectize.vue';
  import { queryParam } from '../../utils/routers';
  import wbLogApi from '../../api/wb/full-log';
  import {
    STATUS_READY_FOR_APPROVAL,
    STATUS_PIC_APPROVAL,
    STATUS_DISPATCH_APPROVAL,
  } from '../../store/modules/wb/consts';

  const dateFormat = 'MM/dd/yyyy';

  export default {
    mixins: [tableMixin('tables/wb', wbLogApi)],
    components: {
      SortableTable,
      Selectize,
      DatePicker,
      Badge,
      ButtonEl: Button,
      CheckboxEl: Checkbox,
    },
    computed: {
      ...mapGetters('wb', [
        'availableAircrafts',
        'availablePilots',
        'availableAirports',
      ]),

      mergedFilters() {
        return pickBy({
          aircraft: this.tailNumber,
          pilot: this.pilotId,
          date_0: this.dateFrom,
          date_1: this.dateTo,
          last24: this.last24,
          arrival: this.arrival,
          departure: this.departure,
        });
      },

      tailNumber: queryParam({
        param: 'tail_number',
        defaultValue: 0,
        mapper: Number,
      }),

      csvLink() {
        return `/wb/api/full_logs.csv/?${qs.stringify(this.mergedFilters)}`;
      },

      dateFrom: queryParam({ param: 'date_from' }),
      dateTo: queryParam({ param: 'date_to' }),
      pilotId: queryParam({
        param: 'pilot',
        defaultValue: 0,
        mapper: Number,
      }),
      arrival: queryParam({
        param: 'arrival',
        defaultValue: 0,
        mapper: Number,
      }),
      departure: queryParam({
        param: 'departure',
        defaultValue: 0,
        mapper: Number,
      }),
      last24: queryParam({
        param: 'last24',
        defaultValue: false,
        mapper: Boolean,
      }),

      dateRange: {
        get() {
          return !(this.dateFrom && this.dateTo) ? '' : [
            parse(this.dateFrom, dateFormat, new Date()),
            parse(this.dateTo, dateFormat, new Date()),
          ];
        },
        set(dateRange) {
          if (dateRange === undefined) {
            this.dateFrom = '';
            this.dateTo = '';
            return;
          }

          const [dateFrom, dateTo] = dateRange
            .map(date => (isValid(date) ? format(date, dateFormat) : ''));

          this.dateFrom = dateFrom;
          this.dateTo = dateTo;
        },
      },
    },

    created() {
      this.getAllOptions();
      this.getAvailablePilots();
    },

    methods: {
      ...mapActions('wb', [
        'getAllOptions',
        'getAvailablePilots',
        'getAvailableAirports',
      ]),

      badgeType(log) {
        const statusMap = [
          { type: 'danger', filter: status => status === STATUS_DISPATCH_APPROVAL },
          { type: 'info', filter: status => status === STATUS_PIC_APPROVAL },
          { type: 'success', filter: status => status === STATUS_READY_FOR_APPROVAL },
        ];
        const status = statusMap.find(({ filter }) => filter(log.status));
        return status && status.type;
      },

      formatTime(date) {
        return format(date, 'YYYY-MM-dd HH:mm');
      },

      formatDate(date) {
        return format(date, 'YYYY-MM-dd');
      },

      clearFilters() {
        this.tailNumber = '';
        this.dateRange = undefined;
        this.pilotId = 0;
        this.last24 = false;
        this.arrival = 0;
        this.departure = 0;
      },
    },
  };
</script>
<template>
  <div class="box">
    <h1 class="heading">WB Logs</h1>
    <div class="row filter-row">
      <div class="col-lg-3 col-xs-12">
        <selectize
          class="manifests-list__filter-item"
          v-model="tailNumber"
          :items="availableAircrafts"
          field="registration"
          label="Tail Number"
          full-label="Select Aircraft"
        />
      </div>

      <div class="col-lg-3 col-xs-12">
        <label class="control-label">Date Range</label>
        <div>
          <date-picker v-model="dateRange"
                       type="daterange"
                       format="MM/dd/yyyy"
                       placeholder="Pick date range"/>
        </div>
      </div>

      <div class="col-lg-3 col-xs-12">
        <selectize
          class="manifests-list__filter-item"
          v-model="pilotId"
          :items="availablePilots"
          field="name"
          label="Pilot"
          full-label="Select Pilot"
        />
      </div>
    </div>

    <div class="row filter-row">
      <div class="col-lg-3 col-xs-12">
        <selectize
          class="manifests-list__filter-item"
          v-model="departure"
          :items="availableAirports"
          field="iata"
          label="Departure Airport"
          full-label="Select Departure Airport"
        />
      </div>

      <div class="col-lg-3 col-xs-12">
        <selectize
          class="manifests-list__filter-item"
          v-model="arrival"
          :items="availableAirports"
          field="iata"
          label="Arrival Airport"
          full-label="Select Arrival Airport"
        />
      </div>
      <div class="col-lg-2 col-xs-12 filter-row__buttons">
        <checkbox-el v-model="last24">Last 24H</checkbox-el>
      </div>
      <div class="col-lg-4 col-xs-12 filter-row__buttons">
        <button-el @click="clearFilters" type="primary" icon="close" class="pull-right">
          Clear Filters
        </button-el>

        <a class="btn btn-info pull-left" download="wb_logs.csv" :href="csvLink">
          <i class="fa fa-download" />
          Download as CSV</a>
      </div>
    </div>

    <div class="results">
      <sortable-table namespace="tables/wb" :page-size="200" :filters="mergedFilters">
        <el-table-column
          prop="status"
          label="Status"
          width="120"
          align="center"
          sortable
        >
          <template slot-scope="props">
            <badge :type="badgeType(props.row)" :label="props.row.verbose_status" />
          </template>
        </el-table-column>

        <el-table-column prop="tail_number" label="Tail Number" sortable width="150" />

        <el-table-column prop="aircraft_type_name" label="Aircraft Type" sortable width="150">
          <template slot-scope="scope">
            {{ scope.row.aircraft_type_name }}
          </template>
        </el-table-column>

        <el-table-column prop="bew" label="BEW" sortable width="90" />
        <el-table-column prop="cg" label="CG" sortable width="90" />

        <el-table-column prop="departure_iata" label="Departure" sortable width="130">
          <template slot-scope="scope">
            {{ scope.row.departure_iata || (scope.row.flight && scope.row.flight.origin) }}
          </template>
        </el-table-column>

        <el-table-column prop="arrival_iata" label="Arrival" sortable width="130">
          <template slot-scope="scope">
            {{ scope.row.arrival_iata || (scope.row.flight && scope.row.flight.destination) }}
          </template>
        </el-table-column>

        <el-table-column prop="real_flight_number" label="Flight #" sortable width="130" />

        <el-table-column prop="pic_name" label="PIC" sortable width="200" />
        <el-table-column prop="sic_name" label="SIC" sortable width="200" />

        <el-table-column prop="flight_date" label="Date(UTC)" sortable width="150" />
        <el-table-column prop="number_of_passengers" label="# of Passengers" sortable width="180" />
        <el-table-column prop="remarks" label="Remarks" sortable width="130" />
        <el-table-column prop="gsc_name" label="GSC" sortable width="200" />
        <el-table-column prop="pic_signature" label="PIC Signature" sortable width="200" />
        <el-table-column prop="dispatch_signature" label="Dispatch Acceptance" sortable width="250" />
        <el-table-column prop="total_tsa_checked_bags" label="Total TSA Checked Bags" width="250" />
        <el-table-column prop="total_gate_checked_bags" label="Total Gate Checked Bags" width="250" />

        <el-table-column :width="130" align="center" fixed="right">
          <template slot-scope="scope">
            <div class="log-list__controls log-list__controls_desktop">
              <router-link
                :to="{ name: 'wb_log', params: { id: scope.row.id } }"
                class="btn btn-info primary btn-sm"
                title="Show log details"
              >
                <i class="fa fa-eye fa-lg" />
              </router-link>

              <a
                :href="`/wb/pdf/${scope.row.id}`"
                class="btn btn-default btn-sm"
                title="Generate PDF log"
                target="_blank"
              >
                <i class="fa fa-file-pdf-o fa-lg" />
              </a>
            </div>
          </template>
        </el-table-column>
      </sortable-table>
    </div>
  </div>
</template>

<style lang="scss">
  .search__filters {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;
  }

  .filter-row {
    &__buttons {
      padding-top: 20px;
    }
  }
</style>
