<script>
  import { mapActions, mapGetters } from 'vuex';

  export default {
    async created() {
      if (!this.pilotBases.length) {
        await this.getAllAvailableAirports();
      }
    },
    props: {
      value: [Array, String],
      controlProps: Object,
    },
    computed: {
      ...mapGetters('airports', ['pilotBases']),

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
      v-for="airport in pilotBases"
      :key="airport.id"
      :label="airport.iata"
      :value="airport.iata" />
  </el-select>
</template>
