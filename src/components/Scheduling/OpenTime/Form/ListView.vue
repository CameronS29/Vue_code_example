<script>
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import { findIndex } from 'lodash';
  import SortableTable, { tableMixin } from 'Common/SortableTable';
  import { openTimeApi } from 'api/scheduling';
  import { DateTime } from 'luxon';
  import update from 'immutability-helper';
  import { connectMixin } from '../../../../sockets';

  const formatDate = date => DateTime.fromISO(date)
    .toLocaleString(DateTime.DATETIME_SHORT);
  const UPDATE_REQUEST = 'UPDATE_REQUEST';

  const connectModule = {
    mutations: {
      [UPDATE_REQUEST](state, request) {
        const index = findIndex(state.results, { id: request.id });

        if (index > -1) {
          state.results = update(state.results, {
            [index]: {
              $merge: request,
            },
          });
        }
      },
    }
  };


  export default {
    mixins: [
      tableMixin('tables/open-time', openTimeApi, connectModule),
      connectMixin('opentime:list'),
    ],
    components: {
      SortableTable,
    },
    computed: {
      ...mapGetters('user', ['user', 'isPilot', 'isPIC', 'isSIC', 'isAdmin', 'isScheduler']),
    },
    filters: {
      fullName(row) {
        if (row.user_info) {
         return `${row.user_info.first_name} ${row.user_info.last_name}`;
        }
        return "";
      },
      date(row) {
        return formatDate(row.request_date);
      },
      duty_on(row) {
        return formatDate(row.duty_start);
      },

      duty_off(row) {
        return formatDate(row.duty_end);
      },
      accepted_pilot(row) {
        return row.accepted_pilot_info ? row.accepted_pilot_info.name : '';
      }
    }
  };
</script>

<template>
  <div class="open-time-list-view">
    <portal to="header">
      <router-link :to="{ name: 'open_time_create' }">
        <el-button type="primary"
                   icon="el-icon-plus"
                   size="small"
                   v-if="isAdmin || isScheduler"
                   round>
          Create New Request
        </el-button>
      </router-link>
    </portal>
    <sortable-table
      namespace="tables/open-time"
      border
      style="width: 100%">

      <el-table-column
        width="80"
      >
        <template slot-scope="props">
          <router-link :to="{ name: 'open_time_get', params: {id: props.row.id} }">
            <el-button type="primary" size="mini" plain>View</el-button>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column
        prop="request_date"
        sortable="request_date"
        label="Request Date"
      >
        <template slot-scope="props">
          {{ props.row | date }}
        </template>
      </el-table-column>

      <el-table-column
        prop="user.first_name"
        sortable="user__first_name"
        label="User Name"
      >
        <template slot-scope="props">
          {{ props.row | fullName }}
        </template>
      </el-table-column>

      <el-table-column
        prop="status"
        sortable="status"
        label="Status"
      >
        <template slot-scope="props">
          <el-tag v-if="props.row.status === 0">Pending</el-tag>
          <el-tag v-else-if="props.row.status === 1" type="info">Accepted</el-tag>
          <el-tag v-else-if="props.row.status === 2" type="success">Approved</el-tag>
          <el-tag v-else-if="props.row.status === 3" type="danger">Declined</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="priority"
        sortable="priority"
        label="Priority"
      >
        <template slot-scope="props">
          <el-tag v-if="props.row.priority === 0" type="danger">IMMEDIATE priority</el-tag>
          <el-tag v-else-if="props.row.priority === 1" type="warning">Urgent priority</el-tag>
          <el-tag v-else-if="props.row.priority === 2" type="info">Medium priority</el-tag>
          <el-tag v-else-if="props.row.priority === 3" type="info">Low priority</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="duty_on"
        sortable="duty_on"
        label="Duty On"
      >
        <template slot-scope="props">
          {{ props.row | duty_on }}
        </template>
      </el-table-column>

      <el-table-column
        prop="duty_off"
        sortable="duty_off"
        label="Duty Off"
      >
        <template slot-scope="props">
          {{ props.row | duty_off }}
        </template>
      </el-table-column>

      <el-table-column
        prop="position"
        sortable="position"
        label="Position"
      >
        <template slot-scope="props">
          <el-tag v-if="props.row.position === 0">Position: PIC</el-tag>
          <el-tag v-if="props.row.position === 1">Position: SIC</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="accepted_pilot"
        sortable="accepted_pilot"
        label="Accepted Pilot"
      >
        <template slot-scope="props">
          {{ props.row | accepted_pilot }}
        </template>
      </el-table-column>

    </sortable-table>
  </div>
</template>

<style scoped lang="scss">
  .open-time-list-view {

  }
</style>
