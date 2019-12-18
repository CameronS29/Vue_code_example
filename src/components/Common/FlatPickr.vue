<script>
  import FlatPickr from 'flatpickr';
  import merge from 'lodash/merge';
  import forEach from 'lodash/forEach';
  import padStart from 'lodash/padStart';

  import Icon from './Icon.vue';

  export default {
    props: {
      value: [Date, String, Object],
      config: {
        type: Object,
        default: {},
      },
      placeholder: {
        type: String,
        default: 'Select date...',
      },
      prefix: String,
      suffix: String,
      valid: {
        type: Boolean,
        default: true,
      },
      disabled: {
        type: Boolean,
        default: false,
      }
    },

    components: {
      Icon,
    },

    mounted() {
      this.picker = new FlatPickr(this.$refs.picker, merge({}, this.config, {
        onOpen: () => {
          window.document.addEventListener('touchstart', this.stopPropagation, true);
          this.eventEmitter('open');
        },
        onClose: () => {
          window.document.removeEventListener('touchstart', this.stopPropagation, true);
          this.eventEmitter('close');
        },
        onChange: [
          this.eventEmitter('input'),
          this.eventEmitter('change'),
        ],
        onMonthChange: this.eventEmitter('monthChange'),
        onYearChange: this.eventEmitter('yearChange'),
        onValueUpdate: this.eventEmitter('update'),
        getWeek: this.getWeekNumber,
      }));
      this.$refs.picker.type = 'tel';

      if (this.value) {
        this.picker.setDate(this.value);
      }
    },

    destroyed() {
      this.picker.destroy();
    },

    methods: {
      stopPropagation(e) {
        e.stopPropagation();
      },
      eventEmitter(event) {
        return (selectedDates, dateStr) =>
          this.$emit(event, selectedDates, dateStr)
      },
      setFocus() {
        this.$refs.picker.focus();
      },
      updateValidValue(dateStr) {
        const { dateFormat, mode } = this.picker.config;
        if (mode && mode !== 'single') {
          return;
        }

        const pickerDate = this.picker.selectedDates[0] || new Date(0);
        const inputDate = this.picker.parseDate(dateStr, dateFormat)
          || pickerDate;

        if (dateStr === this.picker.formatDate(inputDate, dateFormat)
          && pickerDate.getTime() !== inputDate.getTime()) {
          this.picker.setDate(inputDate, true);
        } else if (!dateStr && pickerDate.getTime()) {
          this.picker.setDate(null, true);
          this.$emit('input', null, null)
        }
      },
      getWeekNumber(date) {
        return padStart(FlatPickr.defaultConfig.getWeek(date), 2, '0');
      },
    },

    watch: {
      value(value) {
        if (value) {
          this.picker.setDate(value);
        } else {
          this.picker.clear();
        }
      },
      config: {
        deep: true,
        handler(value) {
          forEach(value, (val, key) => this.picker.set(key, val));
        },
      },
    },
  };
</script>

<template>
  <div class="input-group picker">
    <icon
      v-if="prefix"
      :title="placeholder"
      :class="[
        'input-group-addon',
        'picker__icon',
        { 'picker_invalid__icon': !valid }
      ]"
      :glyph="prefix"
      @click="setFocus"
    ></icon>
    <input
      ref="picker"
      :placeholder="placeholder"
      :disabled="disabled"
      type="tel"
      :class="['form-control', 'picker__input', { 'picker_invalid__input': !valid }]"
      @input="e => updateValidValue(e.target.value)"
    />
    <icon
      v-if="suffix"
      :title="placeholder"
      :class="[
        'input-group-addon',
        'picker__icon',
        { 'picker_invalid__icon': !valid }
      ]"
      :glyph="suffix"
      @click="setFocus"
    ></icon>
  </div>
</template>

<style lang="scss">
  @import "~flatpickr/dist/flatpickr.css";
  @import "~flatpickr/dist/themes/material_green.css";

  .picker__icon {
    cursor: pointer;
  }

  .picker_invalid__icon,
  .picker_invalid__input {
    color: red !important;
    border-color: red !important;
  }
</style>
