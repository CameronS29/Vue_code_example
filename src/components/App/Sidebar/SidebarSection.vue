<script>
  export default {
    name: 'SidebarSection',
  };
</script>

<template>
  <div class="fltops-sidebar-section">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
  @import '../../../../scss/bs-variables';

  .fltops-sidebar-section {
    padding: 0 15px;
    margin-top: -1px;
    border-top: 1px solid lighten($black, 10%);
    background-color: $black;

    &:first-child {
      border-top: none;
    }

    &:empty {
      display: none;
    }
  }
</style>
