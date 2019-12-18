<script>
  import { DateTime } from 'luxon';
  import {mapGetters, mapActions} from 'vuex';
  import SortableTable from 'Common/SortableTable';
  import TableColumn from 'element-ui/lib/table-column';

  export default {
    props: {
      filters: {
        type: Object,
        default: () => ({}),
      },
    },
    components: {
      SortableTable,
      TableColumn,
    },
    computed: {
      ...mapGetters('user', [
        'isAdmin',
      ]),
    },
    methods: {
      ...mapActions('security/delete', [
        'setLog',
      ]),
    },
  };
</script>

<template>
  <sortable-table
    class="dispatch-dashboard__manifests-list"
    namespace="security/table/securityItems"
    :filters="filters"
    query-prefix="q"
    :searchable="false"
  >
    <table-column prop="submission_date_local" label="Recorded Time" minWidth="180" sortable="submission_date" />

    <table-column prop="reason_for_search_name" minWidth="200" label="Reason for Search" sortable="reason_for_search"/>
    <table-column prop="pic_name" minWidth="170" label="PIC" sortable="pic__user__first_name"/>
    <table-column prop="pic_emp_number" minWidth="150" label="PIC Emp. Number" sortable="pic__employee_number"/>
    <table-column prop="sic_name" minWidth="170" label="SIC" sortable="sic__user__first_name"/>
    <table-column prop="sic_emp_number" minWidth="150" label="SIC Emp. Number" sortable="sic__employee_number"/>
    <table-column prop="flight_number" minWidth="150" label="Flight Number" sortable="flight__flight_number" />
    <table-column prop="flight_date" minWidth="180" label="Scheduled Departure Time" sortable="flight__scheduled_departure"  />
    <table-column prop="acutal_datetime_out_local" minWidth="180" label="Actual Departure Time" sortable="flight__flightlog__actual_datetime_out"  />
    <table-column prop="tail_number" minWidth="200" label="Aircraft" sortable="aircraft__registration" />
    <table-column prop="aircraft_type_name" minWidth="200" label="Aircraft Type" sortable="aircraft__type__type" />
    <table-column label="Actions" width="120" fixed="right">
      <template slot-scope="props">
        <router-link
          class="btn btn-primary btn-xs" title="View Security Search Log"
          :to="{ name: 'security_view', params: {id: props.row.id}}"
        >
          <i class="fa fa-eye"></i>
        </router-link>
        <a class="btn btn-default btn-xs" :href="props.row.pdf_url" target="_blank">
          <i class="fa fa-file-pdf-o"></i>
        </a>
        <button class="btn btn-danger btn-xs" title="Delete Log" @click="setLog(props.row)" v-if="isAdmin">
          <i class="fa fa-trash"></i>
        </button>
      </template>
    </table-column>
  </sortable-table>
</template>
