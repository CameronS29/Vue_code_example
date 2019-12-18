<script>
  import Card from 'Common/Card.vue';
  import updateLogMixin, { logProperty } from './updateLogMixin';

  export default {
    mixins: [updateLogMixin],
    components: { Card },
    computed: {
      remarks: logProperty('remarks'),
    },
  };
</script>

<template>
  <card title="Remarks" class="wb-log__remarks">
    <el-input
      type="textarea"
      class="wb-log__remarks-input"
      v-model="remarks"
      :disabled="disabled"
    />
  </card>
</template>

<style lang="scss">
  .wb-log__remarks {
    &-input {
      min-width: 100%;
      max-width: 100%;
    }
  }
</style>
