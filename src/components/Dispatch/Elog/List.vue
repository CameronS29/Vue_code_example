<script>
    import debounce from 'lodash/debounce';
  import { DatePicker, Button, Checkbox } from 'element-ui';
  import Selectize from '../../fields/Selectize.vue';
  import {queryParam} from '../../../utils/routers';
  import pickBy from 'lodash/pickBy';
  import SortableTable from "../../Common/SortableTable";
  import {tableMixin} from "../../Common/SortableTable";
  import elogApi from "../../../api/elog";
  import {mapState, mapActions, mapGetters} from 'vuex';
  import qs from 'query-string';

  const dateFormat = 'MM/DD/Y';

  export default {
    mixins: [tableMixin('tables/elog', elogApi)],
    components: {
      SortableTable,
      Selectize,
      DatePicker,
      ButtonEl: Button,
      CheckboxEl: Checkbox,
    },
    computed: {
      ...mapGetters('wb', [
        'availableAircrafts',
        'availablePilots',
      ]),
      ...mapGetters('dispatch/elog', [
        'status',
      ]),
      downloading() {
        return this.status == 'PENDING'
      },
      mergedFilters() {
        return pickBy({
          aircraft: this.tailNumber,
          pilot: this.pilotId,
          timestamp_0: this.dateFrom,
          timestamp_1: this.dateTo,
          last24: this.last24
        })
      },
      tailNumber: queryParam({
        param: 'tail_number',
        defaultValue: 0,
        mapper: Number,
      }),
      csvLink() {
        return `/flightlog/api/elog.csv/?${qs.stringify(this.mergedFilters)}`
      },
      dateFrom: queryParam({param: 'date_from'}),
      dateTo: queryParam({param: 'date_to'}),
      pilotId: queryParam({
        param: 'pilot',
        defaultValue: 0,
        mapper: Number,
      }),
      last24: queryParam({
        param: 'last24',
        defaultValue: false,
        mapper: Boolean
      }),
      dateRange: {
        get() {
          return !(this.dateFrom && this.dateTo) ? '' : [
            moment(this.dateFrom, dateFormat).toDate(),
            moment(this.dateTo, dateFormat).toDate(),
          ];
        },
        set(dateRange) {
          if (dateRange === undefined) {
            this.dateFrom = '';
            this.dateTo = '';
            return;
          }

          const [dateFrom, dateTo] = dateRange
            .map(date => moment(date))
            .map(date => (date.isValid() ? date.format(dateFormat) : ''));

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
      ]),
      ...mapActions('dispatch/elog', [
        'startDownload',
        'getDownloadStatus'
      ]),
      formatTime(date) {
        return moment(date).format("Y-MM-DD HH:mm");
      },

      formatDate(date) {
        return moment(date).format("Y-MM-DD");
      },
      clearFilters() {
        this.tailNumber = '';
        this.dateRange = undefined;
        this.pilotId = 0;
        this.last24 = false;
      },
      checkDownloadStatus: debounce(function() {
        this.getDownloadStatus()
          .then(res=>{
            console.log(res);
            if (res.state == 'SUCCESS') {
              window.location = res.file_path;
            } else if (res.state === 'FAILURE') {
              console.log(response);
            } else {
              this.checkDownloadStatus();
            }
          });
      }, 2000),
      download() {
        this.startDownload(this.mergedFilters).then(_=>this.checkDownloadStatus())
      }
    },
  }
</script>
<template>
  <div class="box">
    <h1 class="heading">Elog List</h1>
    <div class="row elog-filter">
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
          <date-picker v-model="dateRange" type="daterange" format="MM/dd/yyyy" placeholder="Pick date range"/>
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

      <div class="col-lg-3 col-xs-12 elog-filter__last24">
        <checkbox-el v-model="last24">Last 24H</checkbox-el>
      </div>
      <div class="col-lg-4 col-xs-12 pull-right elog-filter__buttons">
        <button-el @click="clearFilters" type="primary" icon="close" class="pull-right">
          Clear Filters
        </button-el>

        <button-el @click="download" class="btn btn-info pull-left" :disabled="downloading">
          <i class="fa fa-download" v-if="!downloading"></i>
          <i class="fa fa-refresh fa-spin fa-fw" v-if="downloading"></i>
          Download as CSV
        </button-el>
      </div>
    </div>

    <div class="results">
      <sortable-table namespace="tables/elog"
                      :page-size="200"
                      :filters="mergedFilters">
        <el-table-column prop="actual_datetime_out"
                         label="Timestamp"
                         sortable
                         width="230">
        </el-table-column>
        <el-table-column prop="manifest.number_of_pilots"
                         label="# of pilots"
                         sortable
                         width="90">
        </el-table-column>
        <el-table-column prop="manifest.pic_name"
          sortable width="200"
          label="PIC">
        </el-table-column>
        <el-table-column prop="manifest.sic_name"
          sortable width="200"
          label="SIC">
        </el-table-column>
        <el-table-column prop="reporting_profile"
          sortable width="200"
          label="Reporter">
        </el-table-column>
        <el-table-column prop="manifest.number"
          sortable
          label="Flight Manifest #">
        </el-table-column>
        <el-table-column sortable="flight.scheduled_departure"
          label="Scheduled depature time"
          width="180">
          <template slot-scope="scope">
            {{ formatTime(scope.row.flight.scheduled_departure) }}
          </template>
        </el-table-column>
        <el-table-column prop="manifest.tail_number"
          sortable width="100"
          label="Aircraft Tail #">
        </el-table-column>
        <el-table-column prop="number_of_passengers"
          sortable
          label="# of Passengers">
        </el-table-column>
        <el-table-column prop="flight.origin"
          sortable
          label="Origin">
        </el-table-column>
        <el-table-column prop="flight.destination"
          sortable
          label="Destination">
        </el-table-column>

        <el-table-column prop="flight.operating_under"
          sortable
          label="Type of operation">
        </el-table-column>
        <el-table-column prop="flight_time"
          sortable
          label="Flight time">
        </el-table-column>
        <el-table-column prop="instrument_flight_time"
          sortable
          label="Instrument flight time">
        </el-table-column>

        <el-table-column width="170"
          sortable="actual_datetime_out"
          label="Actual Time OUT">
          <template slot-scope="scope">
            {{ formatTime(scope.row.actual_datetime_out) }}
          </template>
        </el-table-column>
        <el-table-column width="170"
          sortable="actual_datetime_off"
          label="Actual Time OFF">
          <template slot-scope="scope">
            {{ formatTime(scope.row.actual_datetime_off) }}
          </template>
        </el-table-column>

        <el-table-column width="170"
          sortable="actual_datetime_on"
          label="Actual Time ON">
          <template slot-scope="scope">
            {{ formatTime(scope.row.actual_datetime_on) }}
          </template>
        </el-table-column>
        <el-table-column width="170"
          sortable="actual_datetime_in"
          label="Actual Time IN">
          <template slot-scope="scope">
            {{ formatTime(scope.row.actual_datetime_in) }}
          </template>
        </el-table-column>

        <el-table-column prop="initial_hobbs"
          sortable
          label="Start HOBBS">
        </el-table-column>
        <el-table-column prop="final_hobbs"
          sortable
          label="End HOBBS">
        </el-table-column>
        <el-table-column prop="fuel_burn"
          sortable
          label="Fuel consumed">
        </el-table-column>
        <el-table-column prop="total_number_of_landings"
          sortable
          label="Total Number of landings">
        </el-table-column>
        <el-table-column prop="approach"
          sortable
          label="Approach type">
        </el-table-column>
        <el-table-column prop="comments"
          sortable width="250"
          label="Comments">
        </el-table-column>
        <el-table-column prop="reporting_email"
          sortable width="250"
          label="User">
        </el-table-column>

        <el-table-column prop="delay"
          sortable width="150"
          label="Delay code (if applicable)">
        </el-table-column>
        <el-table-column prop="number_of_landings_day"
          sortable
          label="Number of landings (DAY)">
        </el-table-column>
        <el-table-column prop="number_of_landings_night"
          sortable
          label="Number of landings (NIGHT)">
        </el-table-column>
        <el-table-column prop="number_of_takeoffs_day"
          sortable
          label="Number of takeoffs (NIGHT)">
        </el-table-column>
        <el-table-column prop="number_of_takeoffs_night"
          sortable
          label="Number of takeoffs (DAY)">
        </el-table-column>
        <el-table-column prop="night_flight_time"
          sortable
          label="Night Flight time">
        </el-table-column>

        <el-table-column prop="block_time"
          sortable
          label="Block time">
        </el-table-column>
        <el-table-column prop="flight.type_of_operations"
          sortable width="150"
          label="Type of operation">
        </el-table-column>
        <el-table-column prop="flight.flight_number"
          sortable
          label="Flight number">
        </el-table-column>
        <el-table-column prop="oil_add_amount"
          sortable
          label="Oil Added">
        </el-table-column>

        <el-table-column
          sortable="open"
          width="130"
          label="Status">
          <template slot-scope="scope">
            <span v-if="scope.row.open"
              class="badge badge-success">Saved
            </span>
            <span v-if="!scope.row.open"
              class="badge badge-danger">Completed
            </span>
          </template>
        </el-table-column>

        <el-table-column label="Action" fixed="right" width="100">
          <template slot-scope="scope">
            <a class="btn btn-info btn-xs"
              v-if="scope.row.open"
              :href="`/flightlog/manifest/${scope.row.manifest.id}/flight_logs/${scope.row.id}/edit/`">
              <i class="fa fa-pencil-square-o"></i></a>

              <a class="btn btn-default btn-xs"
              v-if="!scope.row.open"
              :href="`/flightlog/manifest/${scope.row.manifest.id}/flight_logs/${scope.row.id}/view/`">
              <i class="fa fa-eye"></i></a>

          </template>
        </el-table-column>

      </sortable-table>
    </div>

  </div>
</template>
<style lang="scss" src="../../design/scss/layout.scss"></style>
<style lang="scss">
  .search__filters {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;
  }

  .elog-filter {
    &__last24 {
      padding-top: 25px;
    }
    &__buttons {
      margin-top: 20px;
    }
  }
</style>
