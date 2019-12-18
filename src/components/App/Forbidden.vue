<script>
  export default {
    name: 'Forbidden',
  };
</script>

<template>
  <div class="fltops-forbidden">
    <div class="fltops-forbidden__art"/>
    <div class="fltops-forbidden__description">
      <h2 class="fltops-forbidden__title">Customs Control. Red Channel.</h2>
      <h3 class="fltops-forbidden__subtitle">
        You're not supposed to see this page.
      </h3>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .fltops-forbidden {
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 140px;
    display: flex;
    justify-content: center;
    align-items: center;

    &__art {
      background: url('./assets/stop.svg') no-repeat;
      background-size: contain;
      height: 175px;
      width: 175px;
      margin-right: 30px;
    }

    &__title, &__subtitle {
      font-weight: 100;
    }
  }
</style>
