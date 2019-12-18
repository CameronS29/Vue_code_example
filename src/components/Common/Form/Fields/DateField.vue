<script>
  import { mapGetters, mapActions } from 'vuex';
  import { DateTime } from 'luxon';

  export default {
    props: ["value", "attributes", "timezone"],
    computed: {
      date() {
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
        const date = DateTime.fromJSDate(value);

        this.$emit("input", value
          ? this.timezone
            ? date.setZone(this.timezone, { keepCalendarTime: true }).toISODate()
            : date.toISODate()
          : null);
      }
    }
  };
</script>

<template>
  <div class="date-time-field">
    <el-date-picker v-bind="attributes" type="date" :value="date" @input="input" />
    <slot></slot>
  </div>
</template>
