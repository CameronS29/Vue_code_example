<script>
  import {mapGetters, mapActions} from 'vuex';
  import Errors from "Common/Form/Errors.vue";

  export default {
    props: ['label', 'error', 'success', 'validationData', 'noPadding', 'fullWidth'],
    computed: {
      displayError() {
        return this.validationData && (this.validationData.$error && this.validationData.$dirty);
      },
      displaySuccess() {
        return this.validationData && (!this.validationData.$error && this.validationData.$dirty);
      },
      classes() {
        return {
          'btq-form__group': true,
          'btq-form__group_full-width': !!this.fullWidth,
          'btq-form__group_success': this.success || this.displaySuccess,
          'btq-form__group_error': this.error || this.displayError,
          'btq-form__group_no-padding': this.noPadding
        }
      }
    },
    components: {
      Errors
    }
  }
</script>

<template>
  <div :class="classes">
    <div class="btq-form__label">
      <span v-if="label">{{ label }}</span>
      <slot name="title"></slot>
    </div>
    <div class="btq-form__item">
      <slot></slot>
    </div>
    <div class="btq-form__help-text">
      <slot name="help"></slot>
      <errors :validation-data="validationData" v-if="validationData && (error || displayError)"></errors>
      <slot name="errors" v-if="error"></slot>
    </div>
  </div>
</template>
