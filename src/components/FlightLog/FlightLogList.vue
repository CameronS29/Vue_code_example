<script>
  import LogList from "./mixins/LogList";

  export default {
    mixins: [LogList],
  }
</script>
<template>
  <div>
    <div class="date-range">
      <div>
        <strong>Date Range</strong>
        <div class="range-picker">
          <div class="date-fields">
            <datepicker v-model="dateFrom"></datepicker>
            <datepicker v-model="dateTo"></datepicker>
          </div>
        </div>
      </div>
    </div>
    <div class="results" v-loading="isLoading">
      <el-table :data='flightlogs' border>
        <el-table-column prop="manifest.pic_name"
                         label="PIC">
        </el-table-column>
        <el-table-column prop="manifest.sic_name"
                         label="SIC">
        </el-table-column>
        <el-table-column prop="state.tail_number"
                         label="Tail number">
        </el-table-column>
        <el-table-column prop="reporting_profile"
                         label="Reporter">
        </el-table-column>
        <el-table-column prop="flight.flight_number"
                         label="Flight #">

        </el-table-column>
        <el-table-column label="Date/time in">
          <template slot-scope="scope">
            {{ scope.row.actual_datetime_in | formatTime }}
          </template>
        </el-table-column>
        <el-table-column prop="flight.origin"
                         label="Origin">
        </el-table-column>
        <el-table-column prop="flight.destination"
                         label="Destination">
        </el-table-column>
        <el-table-column prop="flight_time"
                         label="Flight time">
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <button href="#" class="btn-select" @click="selectLog(scope.row)">
              Select
            </button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="setSize"
        @current-change="setPage"
        :current-page.sync="pageValue"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="size"
        layout="sizes, prev, pager, next"
        :total="total">
      </el-pagination>
    </div>

  </div>
</template>
<style lang="scss">
  .date-range {
    width: 400px;
    .range-picker {
      display: flex;
      .date-fields {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        .form-group {
          flex-basis: calc(50% - 10px);
        }
      }
    }
  }

  .results {
    position: relative;
  }

  .el-table .positive-row {
    background: #e2f0e4;
  }

  .btn-select {
    background: #1ab394;
    color: #fff;
    padding: 5px 10px;
    border-radius: 5px;
    display: inline-block;
    border: 0;

    &:hover {
      color: #fff;
    }
  }
</style>
