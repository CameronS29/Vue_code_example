<script>
  import { mapActions, mapGetters } from 'vuex';
  import { TableColumn, Tag } from 'element-ui';

  import SortableTable from '../../../Common/SortableTable';
  import {
    STATUS_READY_FOR_APPROVAL,
    STATUS_PIC_APPROVAL,
    STATUS_DISPATCH_APPROVAL,
  } from '../../../../store/modules/wb/consts';
  import { connectMixin } from '../../../../sockets';

  export default {
    mixins: [connectMixin('wb:locks')],

    props: {
      status: {
        type: [Array, Number],
        default: () => ([]),
      },

      namespace: {
        type: String,
        required: true,
      },
    },

    components: {
      SortableTable,
      TableColumn,
      Tag,
    },

    computed: {
      ...mapGetters('user', [
        'isAdmin',
      ]),
      ...mapGetters('wb/locks', [
        'isLocked',
        'lockUser',
      ]),
    },

    methods: {
      ...mapActions('wb', ['deleteLog']),
      ...mapActions('wb/confirmation', ['openConfirmation']),

      handleDeleteLog({ id }) {
        this.$confirm('This will permanently delete this log. Continue?', 'Confirm Delete', {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          confirmButtonClass: 'el-button--danger',
          type: 'error',
        }).then(() => this.deleteLog(id));
      },

      confirmTitle(logId) {
        return (this.isLocked(logId)
            ? `${this.lockUser(logId)} is confirming this log.`
            : 'Confirm Log.'
        );
      },

      badgeType({ status }) {
        return {
          [STATUS_PIC_APPROVAL]: 'success',
          [STATUS_READY_FOR_APPROVAL]: 'primary',
          [STATUS_DISPATCH_APPROVAL]: 'danger',
        }[status];
      },
    },
  };
</script>

<template>
  <div>
    <sortable-table
      class="dispatch-dashboard__logs-list"
      :namespace="namespace"
      :filters="{ status }"
      query-prefix="l"
      searchable
    >

      <table-column prop="status" label="Status" width="135" align="center">
        <template slot-scope="props">
          <tag :type="badgeType(props.row)">{{ props.row.verbose_status }}</tag>
        </template>
      </table-column>
      <table-column label="Actions" width="90" align="right">
        <template slot-scope="props">
          <button class="btn btn-primary btn-xs"
                  :disabled="isLocked(props.row.id)"
                  :title="confirmTitle(props.row.id)"
                  @click="openConfirmation(props.row)">
            <i class="fa fa-check" />
          </button>
          <button v-if="isAdmin"
                  class="btn btn-danger btn-xs"
                  title="Delete log"
                  @click="handleDeleteLog(props.row)">
            <i class="fa fa-trash" />
          </button>
        </template>
      </table-column>

      <table-column prop="tail_number" label="Tail #" minWidth="89" sortable/>

      <table-column label="Flight #" prop="flight_number" minWidth="105" sortable>
        <template slot-scope="scope">
          {{ scope.row.flight ? scope.row.flight.flight_number : scope.row.flight_number }}
        </template>
      </table-column>

      <table-column label="Date" prop="date" minWidth="90" sortable>
        <template slot-scope="scope">
          <span v-if="scope.row.flight">{{ scope.row.flight.scheduled_departure | ISODateToUS }}</span>
          <span v-else>{{ scope.row.date }}</span>
        </template>
      </table-column>

      <table-column label="Departure" prop="departure_iata" minWidth="125" sortable>
        <template slot-scope="scope">
          {{ scope.row.departure_iata || (scope.row.flight && scope.row.flight.origin) }}
        </template>
      </table-column>

      <table-column label="Arrival" prop="arrival_iata" minWidth="99" sortable>
        <template slot-scope="scope">
          {{ scope.row.arrival_iata || (scope.row.flight && scope.row.flight.destination) }}
        </template>
      </table-column>
    </sortable-table>
  </div>
</template>

<style>
  .dispatch-dashboard__logs-list .cell {
    padding: 0 7px !important;
  }
</style>
