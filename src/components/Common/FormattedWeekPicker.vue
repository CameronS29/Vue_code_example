<script>
  import { DateTime } from 'luxon';

  import { toUSWeekDateRange } from 'utils/date';

  export default {
    props: {
      value: Date,
    },
    computed: {
      weekRange() {
        return toUSWeekDateRange(DateTime.fromJSDate(this.value));
      },
      dateTime() {
        if (!this.value) return null;
        return DateTime.fromJSDate(this.value);
      },
      formattedDate() {
        if (!this.value) return 'Select week';
        return this.weekRange.join(' — ');
      },
      parsedDate() {
        return DateTime.fromJSDate(this.value);
      },
      date: {
        get() {
          return this.value;
        },
        set(date) {
          this.$emit('input', date);
        },
      },
    },
    methods: {
      switchToPreviousMonth() {
        const date = this.parsedDate
          .minus({ weeks: 1 })
          .toJSDate();

        this.$emit('input', date);
      },
      switchToNextMonth() {
        const date = this.parsedDate
          .plus({ weeks: 1 })
          .toJSDate();

        this.$emit('input', date);
      },
    },
  };
</script>

<template>
  <div class="formatted-week-picker">
    <span class="formatted-date">
      <i
        @click="switchToPreviousMonth"
        class="el-icon-arrow-left arrow-icon" />
      <span class="text">{{ formattedDate }}</span>
      <i
        @click="switchToNextMonth"
        class="el-icon-arrow-right arrow-icon" />
    </span>
    <el-date-picker
      v-model="date"
      type="week"
      :clearable="false"
    />
  </div>
</template>

<style lang="scss" scoped>
  @import '../../../scss/bs-variables';

  .formatted-week-picker {
    position: relative;
    overflow: hidden;
    flex: 0 0 220px;
    width: 220px;
    .formatted-date {
      position: absolute;
      font-weight: bold;
      text-transform: uppercase;
      color: $navy;
      border: 1px solid transparentize($navy, .6);
      padding: 10px;
      border-radius: 50px;
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 220px;
      .arrow-icon {
        cursor: pointer;
      }
      .text {

      }
    }
    .el-date-editor {
      opacity: 0;
      width: calc(100% - 60px);
      left: 30px;
      input {
        cursor: pointer;
      }
    }
  }
</style>
