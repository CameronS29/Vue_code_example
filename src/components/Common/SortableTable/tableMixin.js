import isFunction from 'lodash/isFunction';
import createTableStore from '../../../store/factory/table';

const isHotReloadEnabled = module.hot;

/**
 * @typedef  {Object} ApiHelper
 * @property {function(...): Promise} getFilteredResults
 */

/**
 * A mixin, that creates temporary store for {SortableTable}, and reactively watches for its namespace.
 * @param {String|Array|function(Vue): (String|Array)} namespace: Vuex module namespace.
 *  If function, receives $vm instance and must return string or array.
 * @param api {ApiHelper}: table api helper, see {createTableApi} for reference.
 * @param {Object} moduleMixin: Module to mix in table store
 * @returns {Object}: mixin object.
 */
export default (namespace, api, moduleMixin = {}) => {
  const getNamespace = vm => (isFunction(namespace)
    ? namespace(vm)
    : namespace);

  /**
   * TODO: Need to remove it if in vuex will be anything like .getModule in some release
   * @param vm
   * @returns {boolean}
   */
  // eslint-disable-next-line
  const isModuleAlreadyExists = vm => !!vm.$store._modules.root._children[getNamespace(vm)];

  const destroyModule = vm => (
    vm.$store.unregisterModule(getNamespace(vm))
  );

  const createModule = (vm) => {
    const module = createTableStore(api, moduleMixin);
    if (isHotReloadEnabled && isModuleAlreadyExists(vm)) destroyModule(vm);
    vm.$store.registerModule(getNamespace(vm), module);
    return module;
  };

  const replaceModule = (vm, module) => (newNs, oldNs) => {
    vm.$store.unregisterModule(oldNs);
    vm.$store.registerModule(newNs, module);
  };

  return {
    created() {
      const module = createModule(this);
      this.$watch(
        () => getNamespace(this),
        replaceModule(this, module),
      );
    },

    destroyed() {
      /**
       * dirty fix for hotreload because of https://github.com/vuejs/vue/issues/6518
       */
      if (!isHotReloadEnabled) { destroyModule(this); }
    },
  };
};
