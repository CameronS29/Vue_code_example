<script>
  import { formatDate } from '../../FDT/Calendar/DetailViews/Common/utils';

  export default {
    props: {
      flight: {
        type: Object,
        default: () => {
        },
      },
    },
    filters: {
      format(date) {
        return formatDate(date);
      },
    },
  };
</script>

<template>
  <div class="draft-addition-popup__flight">
    <el-tag size="mini">#{{ flight.flight_number }}</el-tag>
    {{ flight.scheduled_departure | format }}
    <el-tag size="mini" type="info">{{ flight.origin }}</el-tag>
    →
    {{ flight.scheduled_arrival | format }}
    <el-tag size="mini" type="info">{{ flight.destination }}</el-tag>
  </div>
</template>

<style scoped>
  .draft-addition-popup__flight {
    white-space: nowrap;
    margin-bottom: 5px;
  }
</style>
