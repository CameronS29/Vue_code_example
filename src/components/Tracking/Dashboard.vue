<script>
  import FlightLogClicks from './Partials/FlightLogClicks.vue';
  import OldFltOpsClick from './Partials/OldFltOpsClick.vue';

  export default {
    name: 'Dashboard',
    components: { OldFltOpsClick, FlightLogClicks },
  };
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <flight-log-clicks />
    </el-col>
    <el-col :span="12">
      <old-flt-ops-click />
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>

</style>
