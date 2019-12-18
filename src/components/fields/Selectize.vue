<script>
  export default {
    props: {
      items: {
        type: Array,
        required: true,
      },

      field: {
        type: String,
        required: true,
      },

      value: {
        type: null,
        default: null,
      },

      label: String,

      minimal: {
        type: Boolean,
        default: false,
      },

      disabled: {
        type: Boolean,
        default: false,
      },

      fullLabel: String,
      idField: {
        type: String,
        default: 'id',
      },
      sort: String,
    },

    mounted() {
      const $select = $(this.$refs.select);

      let config = {
        valueField: this.idField,
        labelField: this.field,
        searchField: [this.field],
        placeholder: this.placeholder,
      };

      if (this.sort) {
        config['sortField'] = this.sort;
      }

      $select.selectize(config);

      const $selectize = this.$refs.select.selectize;
      $selectize.addOption(this.items);
      $selectize.setValue(this.value, true);

      $selectize.on('change', this.emitValue);

      const holder = { value: null };
      $selectize.on('focus', () => {
        holder.value = $select.val();
        const val = $select[0].innerText;

        $selectize.setValue(null, true);
        $selectize.setTextboxValue(val);
        $selectize.updatePlaceholder();
      });

      $selectize.on('blur', () => {
        const { value } = holder;
        if (value && !$selectize.getValue()) {
          $selectize.setValue(value, true);
          holder.value = null;
        }
      });

      if (this.disabled) {
        $selectize.disable();
      }
      this.$selectize = $selectize;

      this.$watch('items', this.watchItems);
      this.$watch('value', this.watchValue);
      this.$watch('disabled', this.watchDisabled);
    },

    destroyed() {
      this.$selectize.destroy();
    },

    computed: {
      placeholder() {
        return this.fullLabel || `Select ${this.label}`;
      },
    },

    methods: {
      clear(e) {
        e.preventDefault();
        this.$selectize.setValue(null);
      },

      emitValue(value) {
        this.$emit('input', value);
      },

      watchDisabled() {
        if (this.disabled) {
          this.$selectize.disable();
        } else {
          this.$selectize.enable();
        }
      },

      watchItems() {
        this.$selectize.off('change');
        this.$selectize.clearOptions();
        this.$selectize.addOption(this.items);
        this.$selectize.on('change', this.emitValue);

        this.$selectize.setValue(this.value, true);
        this.$selectize.refreshOptions(false);
      },

      watchValue() {
        this.$selectize.setValue(this.value, true);
      },
    },
  };
</script>

<template>
  <div>
    <label class="control-label" v-if="label && !minimal">{{label}}</label>
    <div class="select-wrap">
      <a href="#" class="close-button" @click.prevent="clear" v-if="value && !disabled">×</a>
      <select ref="select" class="form-control" :value="this.value" autocomplete="off" :disabled="disabled">
        <option value=""></option>
      </select>
    </div>
  </div>
</template>

<style lang="scss">
  .select-wrap {
    position: relative;

    .selectize-input {
      display: block;
    }

    .close-button {
      position: absolute;
      top: 7px;
      right: 33px;
      z-index: 99;
      color: #000;
    }
  }
</style>
