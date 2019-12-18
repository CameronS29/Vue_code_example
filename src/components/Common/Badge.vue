<script>
  const BADGE_TYPES = new Set([
    '',
    'success',
    'info',
    'warning',
    'danger',
  ]);

  export default {
    props: {
      label: String,
      type: {
        type: String,
        default: '',
        validator: type => BADGE_TYPES.has(type),
      },
    },

    computed: {
      badgeClasses() {
        return [
          'badge',
          this.type !== ''
            ? `badge-${this.type}`
            : ''
        ];
      },
    },
  };
</script>

<template>
  <span :class="badgeClasses">
    <slot>{{ label }}</slot>
  </span>
</template>
