<script>
  import { mapActions, mapMutations, mapGetters, mapState } from 'vuex';


  export default {
    computed: {
      ...mapState('scheduling/calendar/pilotGrid', ['pilotPayroll', 'isLoading']),
      ...mapGetters('scheduling/calendar/pilotGrid', ['filteredPayroll']),
      ...mapState('scheduling/calendar', ['isInPayrollMode']),
      ...mapGetters('scheduling/revisions', ['activeRevision']),
      ...mapGetters('scheduling/calendar/filters', ['payrollCSVLink']),
    },
    methods: {
      ...mapActions('scheduling/calendar/pilotGrid', ['fetchPayroll']),
    },
    watch: {},
  };
</script>

<template>
  <div class="payroll-table" v-loading="isLoading">
    <el-table size="mini" :data="filteredPayroll">
      <el-table-column label="Name" sortable prop="first_name">
        <template slot-scope="props">
          {{ props.row | fullName }}
        </template>
      </el-table-column>

      <el-table-column label="Base" sortable prop="base" />

      <el-table-column label="Actual Block Hours" sortable prop="actual_block_hours" />

      <el-table-column label="Scheduled Block Hours" sortable prop="scheduled_block_hours" />

      <el-table-column label="Initial Block Hours" sortable prop="initial_block_hours" />

      <el-table-column label="Paid Off Days" sortable prop="paid_off_days" />

      <el-table-column label="Scheduled Off Days" sortable prop="scheduled_off_days" />

      <el-table-column label="Actual Off Days" sortable prop="actual_off_days" />

      <el-table-column label="Scheduled Holiday Hours" sortable prop="scheduled_holiday_hours" />

      <el-table-column label="Actual Holiday hours" sortable prop="actual_holiday_hours" />

      <el-table-column label="Ground Trainings" sortable prop="ground_training_count" />

      <el-table-column label="Reserve" sortable prop="reserve_count" />

      <el-table-column label="Sick Days" sortable prop="sick_days" />
    </el-table>
  </div>
</template>


<style lang="scss">
  .payroll-table {
    .el-table {
      td {
        padding: 0;
      }
    }
  }
</style>
