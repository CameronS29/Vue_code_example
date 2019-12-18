<script>
  import { mapState, mapActions, mapGetters } from 'vuex';


  export default {
    created() {
      if (!this.aircraftTypes.length) {
        this.getAircraftTypes();
      }
    },
    props: {
      value: [Array, Number],
      controlProps: Object,
    },
    computed: {
      ...mapState('aircraft', ['aircraftTypes']),

      model: {
        get() {
          return this.elementProps.multiple
            ? this.value.map(value => parseInt(value))
            : this.value ? parseInt(this.value) : this.value;
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
      ...mapActions('aircraft', ['getAircraftTypes']),
    },
    data() {
      return {
        defaultControlProps: {
          filterable: false,
          multiple: false,
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
      v-for="type in aircraftTypes"
      :key="type.id"
      :label="type.name"
      :value="type.id" />
  </el-select>
</template>
