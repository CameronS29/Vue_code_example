<script>
  import { formatDate } from '../../FDT/Calendar/DetailViews/Common/utils';

  export default {
    name: 'AffectedShift',
    props: {
      shift: Object,
      type: String,
    },

    filters: {
      format(date) {
        return formatDate(date);
      },

      tagType(type) {
        return {
          CREATE: 'success',
          UPDATE: 'default',
          DELETE: 'danger',
        }[type];
      },
    },
  };
</script>

<template>
  <div class="draft-addition-popup__shift">
    <el-tag v-if="type" :type="type | tagType" size="small">{{ type }}</el-tag>
    <el-tag type="info" size="small">
      {{ shift.shortcut }} at <strong>{{ shift.base }}</strong>
      (Rev. {{ shift.version }})
    </el-tag>:
    <span>{{ shift.duty_on | format }}</span>&nbsp;&ndash;&nbsp;<span>{{ shift.duty_off | format }}</span>
  </div>
</template>

<style scoped>
  .draft-addition-popup__shift {
    white-space: nowrap;
    margin-bottom: 5px;
  }
</style>
