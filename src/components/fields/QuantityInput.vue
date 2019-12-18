<script>

  export default {
    props: {
      /**
       * Can be bound with .sync modifier
       */
      value: Number,

      /**
       * Can be bound with .sync modifier
       */
      quantity: Number,

      disabled: {
        type: Boolean,
        default: false,
      },
    },

    data() {
      return {
        qtFocus: false,
        valueFocus: false,
        switchFocus: false,
      };
    },

    mounted() {
      this.qtInput = this.$refs.qt.$el.querySelector('input');
      if (this.qtInput !== null) {
        this.qtInput.addEventListener('keydown', this.focusValue);
      }
    },

    destroyed() {
      if (this.qtInput !== null) {
        this.qtInput.removeEventListener('keydown', this.focusValue);
      }
    },

    methods: {
      updateValue(value) {
        this.$emit('update:value', parseInt(value) || null);
      },

      updateQuantity(value) {
        this.$emit('update:quantity', parseInt(value) || null);
      },

      setFocus(focus = false) {
        this.qtFocus = focus;
      },

      setValueFocus(focus = false) {
        this.valueFocus = focus;
      },

      focusValue(e) {
        if (this.qtInput !== null && this.qtInput.value === '' && e.key === 'Backspace') {
          this.$refs.value.focus();
        }
      },
    },

    computed: {
      qtMarkHidden() {
        return !!this.quantity && String(this.quantity).length > 2;
      },

      isFocused() {
        return this.qtFocus || this.valueFocus;
      },
    },
  };
</script>

<template>
  <div class="quantity-input">
    <el-input
      class="quantity-input__value"
      ref="value"
      type="tel"
      size="small"
      :value="value"
      @input="updateValue"
      @focus="setValueFocus(true)"
      @blur="setValueFocus(false)"
      :disabled="disabled"
    />
    <div class="quantity-input__quantity-container"
         :class="{ 'quantity-input__quantity-container_filled': qtMarkHidden,
                   'quantity-input__quantity-container_focus': isFocused,
                   'quantity-input__quantity-container_active': qtFocus }">
      <el-input
        class="quantity-input__quantity"
        ref="qt"
        type="tel"
        size="small"
        :value="quantity"
        @input="updateQuantity"
        @focus="setFocus(true)"
        @blur="setFocus(false)"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<style lang="scss">
  @import "../../../scss/bs-variables";

  .quantity-input {
    position: relative;
    min-width: 88px;

    &__value {
      padding-right: 40px;

      .el-input__inner {
        border-radius: 4px 0 0 4px;
        border-right: none;

        .error & {
          border-color: $--color-danger;
        }
      }
    }

    &__value input,
    &__quantity input {
      -moz-appearance: textfield;
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
      }
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
      }
    }

    &__quantity-container {
      position: absolute;
      border-left: 1px solid $--border-color-base;
      transition: $--border-transition-base;

      width: 40px;
      right: 0;
      top: 0;
      bottom: 0;

      &::after {
        position: absolute;
        bottom: 0;
        right: 5px;
        line-height: 21px;
        content: 'qt';
        display: inline-block;
        font-size: 10px;
        color: $--border-color-base;
        transition: $--color-transition-base, $--fade-transition;

        opacity: 1;
        pointer-events: none;
      }

      &_focus {
        border-color: $--input-focus-border;
      }

      .error & {
        border-color: $--color-danger;
      }

      &_active::after {
        color: $--input-focus-border;

        .error & {
          color: $--color-danger;
        }
      }

      &_filled::after {
        opacity: 0;
      }
    }

    &__quantity {
      width: 100%;
      height: 100%;

      .el-input__inner {
        border-left: none;
        border-radius: 0 4px 4px 0;
        padding: 0 5px;

        .error & {
          border-color: $--color-danger;
        }
      }
    }
  }
</style>
