<script>

  import OnlineTable from './OnlineTable.vue';
  import HistoryTable from './HistoryTable.vue';
  import Collapse from '../../../Common/Collapse.vue';
  import { connectMixin } from '../../../../sockets';

  export default {

    mixins: [
      connectMixin('dispatch:dt-commits'),
    ],

    components: {
      Collapse,
      OnlineTable,
      HistoryTable,
    },
    data() {
      return {
        showHistory: false,
      };
    },
  };
</script>

<template>
  <collapse
    class="in-out-time">
    <template slot="title">
      <div class="in-out-time__title">

        <span class="collapse-el__title">FlightLog changes</span>
        <el-switch
          style=" "
          v-model="showHistory"
          active-text="Full List"
          inactive-text="Online"/>
      </div>
    </template>

    <history-table v-if="showHistory"/>
    <online-table v-else/>
  </collapse>
</template>

<style lang="scss">
  .in-out-time {
    &__title {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .collapse-el__title-wrapper {
      display: block;
      width: 100%;
    }
    .collapse-el__tools {
      display: none;
    }
  }
</style>
