<script>
  import { mapState, mapActions, mapGetters } from 'vuex';


  export default {
    created() {
      if(!this.availableFlightNumbers.length) {
        this.fetchAvailableFlightNumbers();
      }
    },
    props: {
      value: Array,
      controlProps: Object,
    },
    computed: {
      ...mapState('dispatch/flight-list', ['availableFlightNumbers']),

      model: {
        get() {
          return this.value;
        },
        set(value) {
          this.$emit('input', value);
        },
      },
    },
    methods: {
      ...mapActions('dispatch/flight-list', ['fetchAvailableFlightNumbers']),
    },
    data() {
      return {
        defaultControlProps: {
          filterable: true,
          multiple: true,
        },
      };
    },
  };
</script>

<template>
  <el-select
    v-model="model"
    v-bind="Object.assign(defaultControlProps, controlProps)"
  >
    <el-option
      v-for="flightNumber in availableFlightNumbers"
      :key="flightNumber"
      :label="flightNumber"
      :value="flightNumber" />
  </el-select>
</template>
