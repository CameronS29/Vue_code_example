<script>
  import { mapGetters, mapActions } from 'vuex';
  import { DateTime } from 'luxon';

  export default {
    props: ["value", "attributes", "timezone"],
    computed: {
      dateTime() {
        if (!this.value) return null;

        return this.timezone
          ? DateTime.fromISO(this.value, {
            zone: this.timezone,
            setZone: true
          }).setZone('local', { keepCalendarTime: true }).toJSDate()
          : DateTime.fromISO(this.value).toJSDate();
      }
    },
    methods: {
      input(value) {
        const dateTime = DateTime.fromJSDate(value);

        this.$emit("input", value
          ? this.timezone
            ? dateTime.setZone(this.timezone, { keepCalendarTime: true }).toISO()
            : dateTime.toISO()
          : null);
      }
    }
  };
</script>

<template>
  <div class="date-time-field">
    <el-date-picker v-bind="attributes" type="datetime" :value="dateTime" @input="input" />
    <slot></slot>
  </div>
</template>
