<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import ButtonEl from "Common/Button.vue";
  import manifestApi from "../../../../../api/pilotManifest";

  export default {
    data() {
      return {
        pending: false
      }
    },
    props: {
      operation: {
        type: String
      },
    },
    components: {
      ButtonEl,
    },
    computed: {
      disabled() {
        return !this.operation || this.pending;
      }
    },
    methods: {
      ...mapActions('pilotManifest/pickFlight', ['reset',]),
      ...mapActions('pilotManifest/editFlight', ['setFlight',]),
      create() {
        this.setFlight({type_of_operations: this.operation, flight_number: '', scheduled: false});
        this.reset();
      }
    }

  };
</script>
<template>
  <button-el :disabled="disabled"
      type="danger"
      @click="create">
    Unscheduled Flight
    <i class="fa fa-plus" v-if="!pending"></i>
    <i class="fa fa-circle-o-notch fa-spin fa-1x fa-fw" v-else></i>
  </button-el>
</template>
