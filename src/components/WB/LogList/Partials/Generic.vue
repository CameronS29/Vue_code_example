<script>
  import { map, uniq, sortBy, get, property } from 'lodash';
  import { TableColumn, Pagination } from 'element-ui';

  import SortableTable from 'Common/SortableTable';
  import Badge from 'Common/Badge.vue';

  import {
    STATUS_OPEN,
    STATUS_READY_FOR_APPROVAL,
    STATUS_PIC_APPROVAL,
    STATUS_DISPATCH_APPROVAL,
  } from '../../../../store/modules/wb/consts';
  import { queryGetter } from '../../../../utils/routers';


  const filterPairs = values => map(values, value => ({
    text: value,
    value,
  }));

  const uniqValuesOf = (objects, prop) => uniq(map(objects, property(prop)));
  const sortedUniqOf = (objects, prop, iteratee = undefined) =>
    sortBy(uniqValuesOf(objects, prop), iteratee);

  const sortedPairs = (...args) => filterPairs(sortedUniqOf(...args));

  export default {
    props: {
      prefix: String,
      namespace: String,

      states: {
        type: Array,
        default: () => ([]),
      },

      isLoaded: {
        type: Boolean,
        default: true,
      },

      controlsWidth: [Number, String],
    },

    components: {
      SortableTable,
      TableColumn,
      Pagination,
      Badge,
    },

    methods: {
      badgeType(log) {
        const statusMap = [
          { type: 'danger', filter: status => status === STATUS_DISPATCH_APPROVAL },
          { type: 'info', filter: status => status === STATUS_PIC_APPROVAL },
          { type: 'success', filter: status => status === STATUS_READY_FOR_APPROVAL },
        ];
        const status = statusMap.find(({ filter }) => filter(log.status));
        return status && status.type;
      },

      filterPairs(path) {
        return sortedPairs(this.logs, path);
      },

      filterBy(path) {
        return (value, row) => (value === get(row, path));
      },
    },

    computed: {
      search: queryGetter('search'),
      acType: queryGetter('type'),

      tableStyles() {
        return {
          fontSize: '13px',
          lineHeight: '20px',
        };
      },

      filterStatus() {
        return [
          [STATUS_OPEN, 'New log'],
          [STATUS_READY_FOR_APPROVAL, 'Open'],
          [STATUS_PIC_APPROVAL, 'Dispatch pending'],
          [STATUS_DISPATCH_APPROVAL, 'Closed'],
        ].map(([value, text]) => ({ value, text }));
      },

      filters() {
        const { search, states, acType } = this;
        return {
          search,
          status: states,
          aircraft_type: acType,
        };
      },
    },
  };
</script>

<template>
  <div class="wb-log-list">
    <sortable-table :query-prefix="prefix"
                    :namespace="namespace"
                    :filters="filters"
                    :is-bordered="false"
                    :page-size="50">
      <table-column
        prop="tail_number"
        label="Tail #"
        min-width="85"
        sortable="tail_number"
      >
        <template slot-scope="props">
          <badge :type="badgeType(props.row)" class="badge-border"/>
          {{ props.row.tail_number }}
        </template>
      </table-column>

      <table-column label="Flight #" prop="flight_number" min-width="100" sortable="flight_number">
        <template slot-scope="scope">
          {{ scope.row.flight ? scope.row.flight.flight_number : scope.row.flight_number }}
        </template>
      </table-column>

      <table-column label="Date" prop="date" min-width="95" sortable="date">
        <template slot-scope="scope">
          <span v-if="scope.row.flight">{{ scope.row.flight.scheduled_departure | ISODateToUS }}</span>
          <span v-else>{{ scope.row.date }}</span>
        </template>
      </table-column>

      <table-column label="Origin" prop="departure_iata" min-width="95" sortable="origin">
        <template slot-scope="scope">
          {{ scope.row.departure_iata || (scope.row.flight && scope.row.flight.origin) }}
        </template>
      </table-column>

      <table-column label="Dest." prop="arrival_iata" min-width="90" sortable="destination">
        <template slot-scope="scope">
          {{ scope.row.arrival_iata || (scope.row.flight && scope.row.flight.destination) }}
        </template>
      </table-column>

      <table-column
        prop="status"
        label="Status"
        width="120"
        :filters="filterStatus"
        :filter-method="filterBy('status')"
        :filter-multiple="false"
        align="center"
        sortable="status"
      >
        <template slot-scope="props">
          <badge :type="badgeType(props.row)" :label="props.row.verbose_status" />
        </template>
      </table-column>

      <table-column :width="controlsWidth" fixed="right">
        <template slot-scope="props">
          <div class="wb-log-list__controls wb-log-list__controls_desktop">
            <slot v-bind="props"/>
          </div>
        </template>
      </table-column>
    </sortable-table>
  </div>
</template>

<style lang="scss">
  .wb-log-list {
    .el-table__body {
      .cell {
        padding: 0 7px !important;
      }

      .el-table__row td {
        padding: 4px 0 !important;
      }
    }

    .badge-border {
      display: block !important;
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
  }
</style>
