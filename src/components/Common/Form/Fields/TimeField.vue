<script>
  import { mapGetters, mapActions } from 'vuex';
  import { DateTime } from 'luxon';

  export default {
    props: ["value", "attributes"],
    computed: {
      dateTime() {
        if (!this.value) return null;
        return DateTime.fromISO(this.value).toJSDate();
      }
    },
    methods: {
      input(value) {
        this.$emit("input", value ? DateTime.fromJSDate(value).toISO() : null);
      }
    }
  };
</script>

<template>
  <div class="time-field">
    <el-time-picker v-bind="attributes" :value="dateTime" @input="input" />
    <slot></slot>
  </div>
</template>
