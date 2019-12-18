<script>
  import { Row, Col, Select, Option } from 'element-ui';

  import DatetimeInput from '../../fields/DatetimeInput.vue';

  export default {
    data() {
      return {
        engineVals: [1, 0],
        outUpdateTrigger: null,
        inUpdateTrigger: null,
        overlappedLogs: [],
      };
    },
    components: {
      ElRow: Row,
      ElCol: Col,
      ElSelect: Select,
      ElOption: Option,
      DatetimeInput,
    },
    methods: {
      SendVidecomDates() {
      },
    },
  };
</script>

<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12" :offset="6">
        <span>
          First time
        </span>
        <datetime-input/>
        <div/>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12" :offset="6">
        <span>
          Second time
        </span>
        <datetime-input/>
        <div/>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12" :offset="6">
        <el-button
          @click="SendVidecomDates"
          size="small"
          style="width:100%"
          type="primary"><i class="fa fa-arrow-down"/> SEND
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss">

</style>

