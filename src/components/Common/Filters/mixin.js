import { isFunction, get } from 'lodash';
import createFiltersStore from 'store/factory/filters';
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';

const isHotReloadEnabled = module.hot;

export default (namespace, options = {}) => {
  const getNamespace = vm => isFunction(namespace)
    ? namespace(vm)
    : namespace;

  /**
   * TODO: Need to remove it if in vuex will be anything like .getModule in some release
   * @param vm
   * @returns {boolean}
   */
  const isModuleAlreadyExists = vm => !!get(
    vm.$store._modules.root._children,
    getNamespace(vm).split('/').join('._children.'),
  );

  const destroyModule = vm => {
    vm.$store.unregisterModule(getNamespace(vm).split('/'));
  };

  const createModule = vm => {
    const module = createFiltersStore(vm.$store, vm.$router, namespace, options);
    if (isHotReloadEnabled && isModuleAlreadyExists(vm)) destroyModule(vm);
    vm.$store.registerModule(getNamespace(vm).split('/'), module);
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

    computed: {
      ...mapState(namespace, ['filters']),
      ...mapGetters(namespace, ['filterModels', 'filterMap', 'hasFilters']),
    },

    methods: {
      ...mapMutations(namespace, ['removeFilter', 'removeAllFilters', 'addFilter']),
    },

    destroyed() {
      /**
       * dirty fix for hotreload because of https://github.com/vuejs/vue/issues/6518
       */
      if (!isHotReloadEnabled) destroyModule(this);
    },
  };
};
