<script>
  import { mapActions, mapGetters } from 'vuex';

  export default {
    created() {
      if (!this.airports.length) {
        this.getAllAvailableAirports();
      }
    },
    props: {
      value: [Array, String, Number],
      controlProps: Object,
      output: {
        type: String,
        default: 'iata', // ['iata' | 'id']
      },
    },
    computed: {
      ...mapGetters('airports', ['airports']),

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
      ...mapActions('airports', ['getAllAvailableAirports']),
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
      v-for="airport in airports"
      :key="airport.id"
      :label="airport.iata"
      :value="output === 'iata' ? airport.iata : airport.id" />
  </el-select>
</template>
