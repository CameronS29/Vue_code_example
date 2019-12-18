<script>
  export default {
    created() {
      this.$store.dispatch("pilots/getPilots");
    },
  };
</script>

<template>
  <transition>
    <router-view />
  </transition>
</template>
