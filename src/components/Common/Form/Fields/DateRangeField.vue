<script>
  import { DateTime } from 'luxon';

  export default {
    props: {
      value: Array,
      startDateProps: Object,
      endDateProps: Object,
    },
    computed: {
      startDate: {
        get() {
          if (!this.value[0]) return null;

          return DateTime.fromISO(this.value[0]).toJSDate();
        },
        set(value) {
          this.$emit('input', [
            DateTime.fromJSDate(value).toISO(),
            this.value[1],
          ]);
        },
      },
      endDate: {
        get() {
          if (!this.value[1]) return null;

          return DateTime.fromISO(this.value[1]).toJSDate();
        },
        set(value) {
          this.$emit('input', [
            this.value[0],
            DateTime.fromJSDate(value).toISO(),
          ]);
        },
      },
    },
    data() {
      return {
        defaultStartDateProps: {
          placeholder: 'Start Date',
          type: 'date',
        },
        defaultEndDateProps: {
          placeholder: 'End Date',
          type: 'date',
        },
      };
    },
  };
</script>

<template>
  <div>
    <el-date-picker
      v-model="startDate"
      v-bind="Object.assign(defaultStartDateProps, startDateProps)" />
    —
    <el-date-picker
      v-model="endDate"
      v-bind="Object.assign(defaultEndDateProps, endDateProps)" />
  </div>
</template>
