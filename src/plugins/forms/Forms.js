import mapValues from 'lodash/mapValues';

/**
 * Vue plugin providing support for automatic display of errors based on vuelidate input
 */
export default function ValidationErrors(Vue) {
  Vue.mixin({
    provide() {
      const provide = {};
      if (this.$options.fieldErrors) {
        provide['formFieldErrors'] = mapValues(
          this.$options.fieldErrors, value => value.bind(null, this));
      }
      if (this.$options.globalErrors) {
        provide['formGlobalErrors'] = this.$options.globalErrors;
      }
      return provide;
    },
  });

}
