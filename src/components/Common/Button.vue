<script>
  import Icon from './Icon.vue';

  export default {
    props: {
      icon: {
        type: [String, Object],
        default: null,
      },
      label: String,
      outline: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        default: 'primary',
      },
      size: String,
      rounded: {
        type: Boolean,
        default: false,
      }
    },

    components: {
      Icon,
    },

    computed: {
      className() {
        return [
          'btn',
          `btn-${this.type}`,
          {'btn-outline': this.outline},
          {'btn-rounded': this.rounded},
          {[`btn-${this.size}`]: this.size},
        ];
      },

      iconProps() {
        return (typeof this.icon === 'string'
          ? {glyph: this.icon}
          : this.icon);
      },
    },
  };
</script>

<template>
  <button :class="className" @click="e => $emit('click', e)">
    <icon v-if="icon" v-bind="iconProps"/>
    <slot>{{ label }}</slot>
  </button>
</template>
