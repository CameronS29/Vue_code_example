<script>
  import map from 'lodash/map';
  import property from 'lodash/property';
  import uniq from 'lodash/uniq';
  import sortBy from 'lodash/sortBy';

  import { Table, TableColumn, Pagination } from 'element-ui'
  import Badge from '../../../Common/Badge.vue';

  import {
    STATUS_OPEN,
    STATUS_PENDING_PIC,
    STATUS_DISPATCH_PENDING,
    STATUS_DISPATCH_RE_OPEN,
    STATUS_COMPLETED
  } from '../../../../store/modules/flightlog/consts';


  const filterPairs = values => map(values, value => ({ text: value, value }));

  const uniqValuesOf = (objects, prop) => uniq(map(objects, property(prop)));
  const sortedUniqOf = (objects, prop, iteratee = undefined) =>
    sortBy(uniqValuesOf(objects, prop), iteratee);

  const sortedPairs = (...args) => filterPairs(sortedUniqOf(...args));

  export default {
    props: {
      logs: {
        type: Array,
        required: true,
      },

      page: Number,
      pageSize: Number,
      count: Number,

      isLoaded: {
        type: Boolean,
        default: true,
      },

      controlsWidth: {
        type: Number,
        required: false,
      },
    },

    components: {
      TableEl: Table,
      TableColumn,
      Pagination,
      Badge,
    },

    methods: {
      badgeType(log) {
        const statusMap = [
          {type: 'success', filter: status => [STATUS_PENDING_PIC, STATUS_OPEN].indexOf(status) >= 0},
          {type: 'info', filter: status => status === STATUS_DISPATCH_PENDING},
          {type: 'warning', filter: status => status === STATUS_DISPATCH_RE_OPEN},
          {type: 'danger', filter: status => status === STATUS_COMPLETED},
        ];
        const status = statusMap.find(({filter}) => filter(log.status));
        return status && status.type;
      },

      filterPairs(path) {
        return sortedPairs(this.logs, path);
      },

      filterBy(path) {
        return (value, row) => (value === property(path)(row));
      },
    },

    computed: {
      tableStyles() {
        return {
          fontSize: '13px',
          lineHeight: '20px',
        };
      },

      filterStatus() {
        return [
          [STATUS_OPEN, 'Open'],
          [STATUS_PENDING_PIC, 'PIC Pending'],
          [STATUS_DISPATCH_PENDING, 'Dispatch Pending'],
          [STATUS_DISPATCH_RE_OPEN, 'Dispatch Re-Open'],
          [STATUS_COMPLETED, 'Completed'],
        ].map(([value, text]) => ({value, text}));
      },
    },
  };
</script>

<template>
  <div class="log-list">
    <div v-loading="!isLoaded">
      <table-el :data="logs" class="log-list__table" :style="tableStyles">
        <table-column
            prop="status"
            label="Status"
            width="120"
            :filters="filterStatus"
            :filterMethod="filterBy('status')"
            :filterMultiple="false"
            align="center"
          >
          <template slot-scope="props">
            <badge :type="badgeType(props.row)" :label="props.row.verbose_status"></badge>
          </template>
        </table-column>
        <table-column
          label="Flight Manifest #"
          prop="number"
          :filters="filterPairs('number')"
          :filterMethod="filterBy('number')"
          minWidth="89"
          sortable
        ></table-column>
        <table-column
          label="Date"
          prop="created_on"
          minWidth="90"
          sortable
        ></table-column>
        <table-column
          prop="tail_number"
          label="Tail #"
          :filters="filterPairs('tail_number')"
          :filterMethod="filterBy('tail_number')"
          minWidth="89"
          sortable
        >
        </table-column>
        <table-column
          label="A/C Type"
          prop="aircraft_type_name"
          :filters="filterPairs('aircraft_type_name')"
          :filterMethod="filterBy('aircraft_type_name')"
          minWidth="125"
          sortable
        ></table-column>
        <table-column
          label="PIC"
          prop="pic_name"
          minWidth="100"
          sortable
        ></table-column>
        <table-column
          prop="sic_name"
          label="SIC"
          width="100"
          sortable
        >
        </table-column>
        <table-column
          prop="flightlog_count"
          label="# of Legs"
          width="80"
          sortable
        >
        </table-column>

        <table-column :width="controlsWidth" align="center" fixed="right">
          <template slot-scope="props">
            <div class="log-list__controls log-list__controls_desktop">
              <slot v-bind="props"></slot>
            </div>
          </template>
        </table-column>
      </table-el>
    </div>

    <div class="log-list__pagination" v-if="count && page">
      <pagination
        @size-change="size => $emit('pageSizeChange', size)"
        @current-change="page => $emit('pageChange', page)"
        :current-page="page"
        :page-sizes="[50, 100, 200, 500]"
        :page-size="pageSize"
        :total="count"
        layout="sizes, prev, pager, next"
      ></pagination>
    </div>
  </div>
</template>

<style>
  .log-list__table .cell {
    padding: 0 7px !important;
  }

  .log-list__table .el-table__header-wrapper {
    user-select: none;
  }

  .log-list__pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .el-table__row {
    position: relative;
  }

  .badge-border {
    display: block!important;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    max-width: 3px;
    padding: 0;
    border: 0;
    border-radius: 0;
    min-width: 3px;
  }
</style>
