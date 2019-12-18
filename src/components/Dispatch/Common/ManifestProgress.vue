<script>
  import {ProgressBar, StatusItem} from '../../Common/StatusProgess';
  import {
    STATUS_OPEN,
    STATUS_PENDING_PIC,
    STATUS_DISPATCH_PENDING,
    STATUS_DISPATCH_RE_OPEN,
    STATUS_COMPLETED
  } from '../../../store/modules/flightlog/consts';

  export default {
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
          {type: STATUS_OPEN, name: 'Open', icon: 'plus'},
          {type: STATUS_PENDING_PIC, name: 'Pending PIC', icon: 'globe'},
          {type: STATUS_DISPATCH_PENDING, name: 'Dispatch Pending', icon: 'diamond'},
          {type: STATUS_DISPATCH_RE_OPEN, name: 'Dispatch Re-Open', icon: 'folder-open-o'},
          {type: STATUS_COMPLETED, name: 'Completed', icon: 'file-text-o'},
        ];
      },
    },
  };
</script>

<template>
  <progress-bar :step="status" completed>
    <status-item
      v-for="step in statusItems"
      :key="step.type"
      :caption="step.name"
      :step="step.type"
      :icon="step.icon"
    />
  </progress-bar>
</template>
