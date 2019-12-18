<script>
  import find from 'lodash/find';
  import { DateTime } from 'luxon';
  import { mapActions, mapGetters, mapMutations } from 'vuex';
  import { Row, Col } from 'element-ui';

  export default {
    components: {
      ElRow: Row,
      ElCol: Col,
    },

    computed: {
      ...mapGetters('security', [
        'item',
      ]),
    },
  };
</script>


<template>
  <div>
    <el-row>
      <el-col :sm="12" :md="4">
        Reason for search<br/><strong>{{item.reason_for_search_name}}</strong>
      </el-col>
      <el-col :sm="12" :md="4">
        Flight Number<br/><strong>{{item.flight_number}}</strong>
      </el-col>
      <el-col :sm="12" :md="6">
        Scheduled Departure DateTime<br/><strong>{{item.flight_date}}</strong>
      </el-col>
      <el-col :sm="12" :md="6">
        Actual Departure DateTime<br/><strong>{{item.acutal_datetime_out_local}}</strong>
      </el-col>
      <el-col :sm="12" :md="4">
        Tail number<br/><strong>{{item.tail_number}}</strong>
      </el-col>
    </el-row>
    <el-row style="margin-top: 20px;">
      <el-col :sm="12" :md="6">
        PIC<br/><strong>{{item.pic_name}}</strong>
      </el-col>
      <el-col :sm="12" :md="6">
        PIC Emp. Number<br/><strong>{{item.pic_emp_number}}</strong>
      </el-col>
      <el-col :sm="12" :md="6">
        SIC<br/><strong>{{item.sic_name}}</strong>
      </el-col>
      <el-col :sm="12" :md="6">
        SIC Emp. Number<br/><strong>{{item.sic_emp_number}}</strong>
      </el-col>
    </el-row>
  </div>
</template>
