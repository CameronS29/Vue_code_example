<script>
  import BaseMixin from "./BaseMixin";

  export default {
    mixins: [BaseMixin],
  };
</script>
§
<template>
  <div class="flight-status-log__event">
    <div class="flight-status-log__event-datetime">
      <span class="flight-status-log__event-date">{{ date }}</span>
      <span class="flight-status-log__event-time">{{ time }}</span>
    </div>
    <div class="flight-status-log__event-message">
      Flight marked as <el-tag>{{ commit.diversion_type_verbose }}</el-tag>
    </div>
  </div>
</template>
