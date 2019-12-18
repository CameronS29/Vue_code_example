<script>
  import BaseMixin from "./BaseMixin";
  export default {
    mixins: [BaseMixin],
  }
</script>

<template>

  <div class="flight-status-log__event">
    <div class="flight-status-log__event-datetime">
      <span class="flight-status-log__event-date">{{ date }}</span>
      <span class="flight-status-log__event-time">{{ time }}</span>
    </div>
    <div class="flight-status-log__event-message">
      {{ commit.author.first_name }} {{ commit.author.last_name }}
      <el-tag type="success" v-if="commit.author.is_pic">PIC</el-tag>
      <el-tag type="info" v-else-if="commit.author.is_sic">SIC</el-tag>
      <el-tag type="danger" v-if="commit.author.is_dispatcher">Dispatcher</el-tag>
      <el-tag type="danger" v-if="commit.author.is_admin">Admin</el-tag>
      changed status of WB Log to <strong>{{ commit.status }}</strong>
      <span>{{ commit.initials }}</span>
    </div>
    <div class="flight-status-log__event-controls">
      <router-link
        :to="{ name: 'wb_log', params: { id: commit.wb_log} }"
      >
        <el-button
          size="mini"
          type="primary">
          WB Log
        </el-button>
      </router-link>
    </div>
  </div>
</template>


<style scoped>

</style>
