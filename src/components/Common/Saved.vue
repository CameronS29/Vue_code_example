<script>
  export default {
    props: ['display']
  }
</script>
<template>
  <div class="action-saved" :class="{'action-saved_active': display}">
    <i class="fa fa-floppy-o" aria-hidden="true"></i> saved
  </div>
</template>
<style lang="scss">
  .action-saved {
    position: fixed;
    z-index: 99999;
    background: #eff6f6;
    color: #5c716f;
    border: 1px solid rgba(169, 176, 176, 0.66);
    border-radius: 3px;
    padding: 0 20px 0 10px;
    opacity: 0;
    font-size: 17px;
    top: 10px;
    transition: all 400ms ease-in-out;
    right: -50px;

    &_active {
      top:10px;
      opacity: 1;
    right: -1px;
    }
  }
</style>
