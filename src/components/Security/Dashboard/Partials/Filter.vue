<script>
  import moment from 'moment';
  import { pickBy } from 'lodash';
  import {mapState, mapActions, mapGetters} from 'vuex';
  import { Row, Col, DatePicker } from 'element-ui';
  import { queryParam } from '../../../../utils/routers';
  import Group from 'Common/Form/Group.vue';
  import SelectField from "../../../fields/Selectize.vue";
  import SearchInput from 'Common/SearchInput.vue';
  import debounce from 'lodash/debounce';
  const dateFormat = 'MM/DD/Y';

  export default {
    components: {
      ElRow: Row,
      ElCol: Col,
      DatePicker,
      Group,
      SelectField,
      SearchInput
    },
    model: {
      prop: 'filters',
      event: 'filter',
    },
    computed: {
      ...mapGetters('security', [
        'reasons',
      ]),
      ...mapGetters('security/csv', [
        'status',
      ]),
      mergedFilters() {
        return pickBy({
          reason_for_search: this.reason_for_search,
          search: this.search,
          submission_date_0: this.dateFrom,
          submission_date_1: this.dateTo,
        });
      },
      downloading() {
        return this.status == 'PENDING'
      },
      reason_for_search: queryParam({
        param: 'reason_for_search',
        defaultValue: 0,
        mapper: Number,
      }),
      search: queryParam({
        param: 'search',
        defaultValue: '',
        mapper: String,
      }),
      dateFrom: queryParam({ param: 'date_from' }),
      dateTo: queryParam({ param: 'date_to' }),
      dateRange: {
        get() {
          return !(this.dateFrom && this.dateTo) ? '' : [
            moment(this.dateFrom, dateFormat).toDate(),
            moment(this.dateTo, dateFormat).toDate(),
          ];
        },
        set(dateRange) {
          if (!dateRange || dateRange === undefined) {
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

    methods: {
      ...mapActions('security/csv', [
        'startDownload',
        'getDownloadStatus'
      ]),
      updateFilters() {
        this.$emit('filter', this.mergedFilters);
      },
      clearFilters() {
        this.reason_for_search = 0;
        this.search = '';
        this.dateRange = undefined;
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

    watch: {
      reason_for_search: 'updateFilters',
      search: 'updateFilters',
      dateFrom: 'updateFilters',
      dateTo: 'updateFilters',
    },
  };
</script>

<template>
  <div>
    <el-row>
      <el-col :sm="12" :md="8">
        <group label="Recorded Date">
          <date-picker type="daterange"
          v-model="dateRange"
          format="MM/dd/yyyy"
          align="right" start-placeholder="Start date"
          end-placeholder="End date" />
        </group>
      </el-col>

      <el-col :sm="12" :md="8">
        <group label="Reason for Search">
          <select-field v-model="reason_for_search" :items="reasons"
            :minimal="true" field="label" id-field="id" label="Reason" />
        </group>
      </el-col>

      <el-col :sm="24" :md="8">
        <group label="Search">
          <search-input v-model="search" class="SearchFilter__search-input" />
          <p class="text text-info">
            Crew Name, Emp.Number, Flight Number, Aircraft#, Aircraft Type
          </p>
          <button class="btn btn-default pull-right" @click="clearFilters">
            <i class="fa fa-close"></i>
            Clear
          </button>
          <button @click="download" class="btn btn-primary pull-right SearchFilter__download" :disabled="downloading">
            <i class="fa fa-download" v-if="!downloading"></i>
            <i class="fa fa-refresh fa-spin fa-fw" v-if="downloading"></i>
            Download as CSV
          </button>
        </group>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
  .SearchFilter {
    &__search-input {
      padding-left: 0;
    }
    &__download {
      margin-right: 20px;
    }
  }
</style>
