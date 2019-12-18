<script>
  export default {
    props: {
      id: [String, Number],
      backUrl: Object,
      backLabel: String
    },
  };
</script>

<template>
  <div class="log-status_not-found">
    <h3 class="log-status_not-found__title">
      Manifest #{{ id }} has not been found...
    </h3>

    <router-link :to="backUrl" class="btn btn-outline btn-primary btn-sm">
      <i class="fa fa-plane" aria-hidden="true"></i>
      {{ backLabel }}
    </router-link>
  </div>
</template>

<style lang="scss">
  .log-status_not-found {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;

    &__title {
      margin: 10% auto 20px auto;
      font-weight: 300;
      font-size: 2em;
    }
  }
</style>
