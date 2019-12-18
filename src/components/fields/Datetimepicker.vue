<script>
  import moment from 'moment';

  import { fromRepr, toRepr } from '../../utils/date';
  import FlatPickr from '../Common/FlatPickr.vue';

  export default {
    props: {
      value: String,
      label: String,
      format: {
        type: String,
        default: 'Y-m-d H:i',
      },
      valid: {
        type: Boolean,
        default: true,
      },
    },

    components: {
      FlatPickr,
    },

    computed: {
      config() {
        return {
          dateFormat: this.format,
          enableTime: true,
          enableSeconds: false,
          time_24hr: true,
          onChange: this.emitDate,
        };
      },

      date: {
        get() {
          return this.value
            ? fromRepr(this.value)
            : null;
        },
        set([selectedDate]) {
          if (selectedDate !== undefined) {
            this.$emit('input', toRepr(selectedDate));
          }
        },
      },
    },
  };
</script>

<template>
  <div class="form-group">
    <label v-if="label">{{ label }}</label>
    <flat-pickr
      v-model="date"
      :config="config"
      :valid="valid"
      suffix="calendar"
    ></flat-pickr>
  </div>
</template>
