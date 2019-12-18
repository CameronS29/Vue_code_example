<script>
  import SidebarSection from './SidebarSection.vue';

  export default {
    components: {
      SidebarSection,
    },
  };
</script>

<template>
  <sidebar-section class="fltops-sidebar-section_bottom">
    <slot />
  </sidebar-section>
</template>

<style lang="scss" scoped>
  @import '../../../../scss/bs-variables';

  .fltops-sidebar-section_bottom {
    flex: 1 0 auto;
    flex-flow: column nowrap;
    justify-content: flex-end;
    display: flex;
    border-top: none;

    &:before {
      content: '';
      display: block;
      height: 1px;
      background: lighten($black, 10%);
      margin: 0 -15px;
    }
  }
</style>
