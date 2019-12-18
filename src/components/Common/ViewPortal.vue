<script>
  export default {
    name: 'ViewPortal',

    props: {
      /**
       * Minimal viewport width to teleport content.
       */
      minWidth: {
        type: String,
        default: '992px',
      },
    },

    data() {
      return { isDisabled: false };
    },

    computed: {
      mql() {
        const mql = window.matchMedia(`(min-width: ${this.minWidth})`);
        mql.addListener(this.handleResize);
        this.handleResize(mql);
        return mql;
      },
    },

    methods: {
      handleResize({ matches }) {
        this.isDisabled = !matches;
      },
    },

    watch: {
      mql(_, oldOne) {
        if (oldOne !== undefined) {
          oldOne.removeListener(this.handleResize);
        }
      },
    },
  };
</script>

<template>
  <portal v-bind="$attrs" :disabled="isDisabled" slim>
    <slot />
  </portal>
</template>

