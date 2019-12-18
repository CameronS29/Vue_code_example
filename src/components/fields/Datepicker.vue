<script>
  import FlatPickr from '../Common/FlatPickr.vue';

  export default {
    props: {
      value: [String, Date],
      label: {
        type: String,
        default: '',
      },
      format: {
        type: String,
        default: 'm/d/Y',
      },
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
      FlatPickr,
    },

    methods: {
      emitDate(_, dateStr) {
        if (dateStr !== '') {
          this.$emit('input', dateStr);
        }
      },
    },
  };
</script>

<template>
  <div class="form-group datepicker">
    <label class="control-label" v-if="label">{{ label }}</label>
    <flat-pickr
      :value="value"
      :valid="valid"
      :config="{ dateFormat: format, weekNumbers: true, allowInput: true }"
      :disabled="disabled"
      suffix="calendar"
      @input="emitDate"
      @change="emitDate"
      @close="emitDate"
      @update="emitDate"
    ></flat-pickr>
  </div>
</template>

<style>
  .datepicker_invalid,
  .datepicker_invalid {
    color: red !important;
    border-color: red !important;
  }
</style>
