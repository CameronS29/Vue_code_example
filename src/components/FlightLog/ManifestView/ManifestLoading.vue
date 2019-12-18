<script>
  import Loader from '../../Common/Loader.vue';

  export default {
    components: {
      Loader,
    },
  };
</script>

<template>
  <div class="log-loading">
    <div class="log-loading__back-off">
      <loader :loaded="false" size="3x"></loader>
      <div class="log-loading__caption">Retrieving Manifest</div>
    </div>
  </div>
</template>

<style lang="scss">
  .log-loading {
    width: 100%;
    height: 100%;
    display: flex;

    &__back-off {
      width: 250px;
      height: 150px;
      display: flex;
      margin: auto;
      text-align: center;
      flex-direction: column;
      justify-content: center;
      border-radius: 10px;
    }

    &__caption {
      margin-top: 20px;
    }
  }
</style>
