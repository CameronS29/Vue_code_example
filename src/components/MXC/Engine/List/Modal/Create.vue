<script>
  import {mapGetters, mapActions} from 'vuex';
  import EngineForm from "../../Common/Form.vue";
  import Card from "../../../../Common/Card.vue";

  export default {
    components: {
      EngineForm,
      Card,
    },
    methods: {
      ...mapActions("engine", [
        "getEngines"
      ]),
      update() {

        this.getEngines();
        this.$router.push({name: "engine_list"});
      }
    }
  }
</script>

<style lang="scss" src="../../../../design/scss/layout.scss"></style>
<template>
  <card title="Create new engine">
    <engine-form :show="true" @create="update" :editable="true"></engine-form>
  </card>

</template>
