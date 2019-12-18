<script>
  import { mapActions, mapGetters } from 'vuex';


  export default {
    created() {
      if (!this.availableAirports.length) {
        this.getAllOptions();
      }
    },
    props: {
      value: Array,
      controlProps: Object,
    },
    computed: {
      ...mapGetters('wb', ['availableAirports']),

      model: {
        get() {
          return this.elementProps.multiple
            ? this.value.map(value => parseInt(value))
            : parseInt(this.value);
        },
        set(value) {
          this.$emit('input', value);
        },
      },

      elementProps() {
        return Object.assign(this.defaultControlProps, this.controlProps);
      },
    },
    methods: {
      ...mapActions('wb', ['getAllOptions']),
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
    v-bind="elementProps"
  >
    <el-option
      v-for="airport in availableAirports"
      :key="airport.id"
      :label="airport.iata"
      :value="airport.id" />
  </el-select>
</template>
