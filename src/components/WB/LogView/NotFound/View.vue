<script>
  export default {
    props: {
      id: [String, Number],
    },
  };
</script>

<template>
  <div class="log-status_not-found">
    <h3 class="log-status_not-found__title">
      Log #{{ id }} has not been found...
    </h3>

    <router-link :to="{ name: 'wb_list' }" class="btn btn-outline btn-primary btn-sm">
      <i class="fa fa-plane" aria-hidden="true" />
      Back to log list
    </router-link>
  </div>
</template>

<style lang="scss">
  .log-status_not-found {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    flex: 1;

    &__title {
      margin: 20px auto;
      font-weight: 300;
      font-size: 2em;
    }
  }
</style>
