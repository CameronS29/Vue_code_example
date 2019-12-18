<script>
  import { padStart } from 'lodash';
  import isValid from 'date-fns/isValid';
  import toDate from 'date-fns/toDate';

  import FlatPickr from 'Common/FlatPickr.vue';
  import TimeInput from './TimeInput.vue';

  function formatTime(date) {
    if (!date) return '';
    const hours = padStart(date.getUTCHours(), 2, '0');
    const minutes = padStart(date.getUTCMinutes(), 2, '0');
    return `${hours}:${minutes}`;
  }

  function formatDate(date) {
    if (!date) return '';
    const month = padStart(date.getUTCMonth() + 1, 2, '0');
    const day = padStart(date.getUTCDate(), 2, '0');
    return `${month}/${day}/${date.getUTCFullYear()}`;
  }

  export default {
    props: {
      value: [String, Date],
      label: String,
      valid: { type: Boolean, default: true },
      disabled: { type: Boolean, default: false },
      dateDisabled: { type: Boolean, default: false },
      timeDisabled: { type: Boolean, default: false },
      maxDate: { type: String, default: null },
      minDate: { type: String, default: null },
      weekNumbers: { type: Boolean, default: true },
    },

    components: {
      FlatPickr,
      TimeInput,
    },

    methods: {
      setDate([date], emit=true) {
        if (!isValid(date)) return this.$emit('input', null);

        this.dateTime.setUTCMonth(date.getMonth());
        this.dateTime.setUTCDate(date.getDate());
        this.dateTime.setUTCFullYear(date.getFullYear());
        this.$refs.timeInput.setFocus();
        this.dateStr = formatDate(this.dateTime);
        if (emit) {
          this.checkAndSave();
        }
      },

      setTime(timeStr, emit=true) {
        const [hours, minutes] = timeStr.split(':');

        this.dateTime.setUTCHours(parseInt(hours));
        this.dateTime.setUTCMinutes(parseInt(minutes));
        this.timeStr = timeStr;
        if (emit) {
          this.checkAndSave();
        }
      },

      checkAndSave() {
        if (this.dateStr && this.dateStr.length > 0 && this.timeStr && this.timeStr.length > 0) {
          this.$emit('input', this.dateTime.toISOString());
        }
      },
    },

    data() {
      const dt = this.value ? toDate(this.value) : null;
      return {
        dateStr: formatDate(dt),
        timeStr: formatTime(dt),
        dateTime: dt || new Date(),
      };
    },

    computed: {
      dateConfig() {
        return {
          dateFormat: 'm/d/Y',
          weekNumbers: this.weekNumbers,
          allowInput: true,
          maxDate: this.maxDate,
          minDate: this.minDate,
        };
      },
    },

    watch: {
      value(newValue, oldValue) {
        if (newValue !== oldValue) {
          const dt = newValue ? toDate(newValue) : null;
          this.dateStr = formatDate(dt, false);
          this.timeStr = formatTime(dt, false);
          this.dateTime = dt || new Date();
        }
      },
    },
  };
</script>

<template>
  <div class="form-group">
    <label v-if="label">{{ label }}</label>
    <div class="picker__group">
      <flat-pickr
        :value="dateStr"
        :config="dateConfig"
        :valid="valid"
        :disabled="disabled || dateDisabled"
        @input="setDate"
        prefix="calendar"
        class="picker_inline picker_left"
      />
      <time-input
        ref="timeInput"
        class="picker picker_inline"
        :valid="valid"
        :value="timeStr"
        @input="setTime"
        :disabled="disabled || timeDisabled"
      />
    </div>
  </div>
</template>

<style lang="scss">
  @import "../../../scss/bs-variables";
  .picker__group {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    margin: 0;
  }
  .picker_inline {
    flex-basis: calc(50% - 10px);
    max-width: calc(50% - 10px);

  }

  .picker_inline:first-child {
    padding-left: 0;
  }

  @media screen and (max-width: $screen-xs-max) {
    .picker__group {
      flex-wrap: wrap;
    }
    .picker_inline {
      flex-basis: 100%;
      max-width: 100%;
      width: 100%;
      margin-bottom: 5px;
      padding-left: 0;
    }
  }
</style>
