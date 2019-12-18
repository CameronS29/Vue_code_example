<script>
  import { DateTime } from 'luxon'

  export default {
    name: "formatted-month-picker",
    props: {
      year: Number,
      month: Number,
    },
    computed: {
      formattedDate() {
        return DateTime.local(this.year, this.month).toFormat('LLL yyyy');
      },
      date: {
        get() {
          return DateTime.local(this.year, this.month).toJSDate();
        },
        set(date) {
          this.$emit('change', date);
        },
      }
    },
    methods: {
      switchToPreviousMonth() {
        const date = DateTime.local(this.year, this.month)
          .minus({ months: 1 })
          .toJSDate();

        this.$emit('change', date);
      },
      switchToNextMonth() {
        const date = DateTime.local(this.year, this.month)
          .plus({ months: 1 })
          .toJSDate();

        this.$emit('change', date);
      },
    },
  }
</script>

<template>
  <div class="formatted-month-picker">
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
      type="month"
      :clearable="false"
      placeholder="Pick a month"
    />

  </div>
</template>

<style lang="scss" scoped>
  @import '../../../scss/bs-variables';

  .formatted-month-picker {
    position: relative;
    overflow: hidden;
    flex: 0 0 140px;
    width: 140px;
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
      width: 140px;
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
