<script>
  import Commit from "../../../Dispatch/Sync/Parials/Commit";
  import BaseMixin from "./BaseMixin";

  export default {
    mixins: [BaseMixin],
    components: { Commit },
    computed: {
      author() {
        return this.log.commit.author;
      },
    },
    methods: {
      goToLog() {

      },
    },
  };
</script>

<template>
  <div class="flight-status-log__event">
    <div class="flight-status-log__event-datetime">
      <span class="flight-status-log__event-date">{{ date }}</span>
      <span class="flight-status-log__event-time">{{ time }}</span>
    </div>
    <div class="flight-status-log__event-message">
      Imported from <code>videcom</code> data source <commit :commit="commit"></commit>
    </div>
    <div class="flight-status-log__event-controls">
      <router-link
        :to="{ name: 'historical_sync', params: { id: commit.sync} }"
      >
        <el-button
          size="mini"
          @click="goToLog"
          type="primary">
          Sync details
        </el-button>
      </router-link>
    </div>
  </div>
</template>
