<script>
  import isFunction from 'lodash/isFunction';

  export default {
    name: 'BreadcrumbItem',

    props: {
      record: Object,
    },

    data() {
      return {
        vmInstance: undefined,
      };
    },

    mounted() {
      this.$nextTick(this.updateVmInstance);
      setTimeout(this.updateVmInstance, 500); // TODO: update this sh*t
    },

    methods: {
      updateVmInstance() {
        this.vmInstance = this.record.instances.default;
      },
    },

    computed: {
      breadcrumb() {
        const { breadcrumb } = this.record.meta;
        const { vmInstance } = this;
        return isFunction(breadcrumb)
          ? vmInstance && breadcrumb(vmInstance)
          : breadcrumb;
      },

      link() {
        const { name, path } = this.record;
        const { breadcrumb_name } = this.record.meta;
        const { params } = this.$route;
        const actualName = breadcrumb_name ? breadcrumb_name : name;
        return actualName
          ? { name: actualName, params }
          : { path, params };

      },
    },
  };
</script>

<template>
  <div>
    <router-link :to="link">{{ breadcrumb }}</router-link>
  </div>
</template>
