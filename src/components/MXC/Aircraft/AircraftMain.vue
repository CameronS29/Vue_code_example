<script>
  export default {
    methods: {
      redirect() {
        if (this.$route.name === "aircraft_dashboard") {
          this.$router.push({name: "mxc_dashboard"})
        }
      }
    },
    watch: {
      "$route"() {
        this.redirect();
      }
    },
    mounted() {
      this.redirect();
    }
  }
</script>
<template>
  <div>
    <router-view></router-view>
  </div>
</template>
