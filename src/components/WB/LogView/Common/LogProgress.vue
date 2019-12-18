<script>
  import { ProgressBar, StatusItem } from '../../../Common/StatusProgess';
  import * as consts from '../../../../store/modules/wb/consts';

  export default {
    name: 'LogProgress',

    props: {
      status: {
        type: Number,
        required: true,
      },
    },

    components: {
      ProgressBar,
      StatusItem,
    },

    computed: {
      statusItems() {
        return [
          { type: consts.STATUS_OPEN, name: 'New Log', icon: 'floppy-o' },
          { type: consts.STATUS_READY_FOR_APPROVAL, name: 'Open Log', icon: 'globe' },
          { type: consts.STATUS_PIC_APPROVAL, name: 'Dispatch Pending', icon: 'diamond' },
          { type: consts.STATUS_DISPATCH_APPROVAL, name: 'Completed', icon: 'file-text-o' },
        ];
      },
    },
  };
</script>

<template>
  <progress-bar class="wb-log-progress" :step="status" completed>
    <status-item
      v-for="step in statusItems"
      :key="step.type"
      :caption="step.name"
      :step="step.type"
      :icon="step.icon"
    />
  </progress-bar>
</template>

<style scoped>
  .wb-log-progress {
    width: 100%;
  }
</style>

