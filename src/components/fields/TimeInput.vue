<script>
  import MaskedInput from 'vue-text-mask';
  import Icon from '../Common/Icon.vue';

  const timeCheckRegex = /((?:[01][0-9])|(?:2[0-3])):([0-5][0-9])/;

  export default {
    props: {
      value: String,
      title: {
        type: String,
        default: 'Fill date...'
      },
      placeholder: {
        type: String,
        default: 'hh:mm',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      valid: {
        type: Boolean,
        default: true,
      },
    },

    components: {
      MaskedInput,
      Icon,
    },

    data() {
      return {
        dirty: false,
      };
    },

    methods: {
      setTime(value) {
        // this.time = value;
        this.dirty = true;

        const matches = timeCheckRegex.exec(value);
        if (matches === null || matches.length !== 3) {
          return;
        }
        this.dirty = false;
        // const newDate = new Date(this.value.getTime());
        // newDate.setHours(Number(matches[1]), Number(matches[2]));

        this.$emit('input', value);
      },

      timeMask(value) {
        return [
          /[012]/,
          value[0] === '2'
            ? /[0-3]/
            : /[0-9]/,
          ':',
          /[0-5]/,
          /[0-9]/,
        ];
      },

      setFocus() {
        this.$refs.input.$el.focus();
      },
    },

    computed: {
      validDate() {
        return !this.dirty;
      },
    },

    watch: {
      value(value) {
        this.dirty = false;
      },
    },
  };
</script>

<template>
  <div class="input-group">
    <masked-input
      ref="input"
      type="tel"
      :placeholder="placeholder"
      :class="['form-control', { 'time-input_invalid-input': !validDate }, { 'time-input_invalid': !valid }]"
      :value="value"
      :guide="true"
      @input="setTime"
      :mask="timeMask"
      :showMask="false"
      :disabled="disabled"
    ></masked-input>
    <icon
      :class="[
        'input-group-addon',
        'time-input__icon',
        { 'time-input_invalid': !valid },
      ]"
      :title="title"
      glyph="clock-o"
      @click="setFocus"
    ></icon>
  </div>
</template>

<style>
  .time-input__icon {
    cursor: pointer;
  }

  .time-input_invalid {
    color: red !important;
    border-color: red !important;
  }

  .time-input_invalid-input {
    color: red !important;
  }
</style>
