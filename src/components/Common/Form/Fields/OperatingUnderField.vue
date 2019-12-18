<script>
  import { mapState, mapActions, mapGetters } from 'vuex';


  export default {
    created() {
      if (!this.availableOperatingUnder.length) {
        this.fetchAvailableOperatingUnder();
      }
    },
    props: {
      value: Array,
      controlProps: Object,
    },
    computed: {
      ...mapState('dispatch/flight-list', ['availableOperatingUnder']),

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
      ...mapActions('dispatch/flight-list', ['fetchAvailableOperatingUnder']),
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
      v-for="availableOperation in availableOperatingUnder"
      :key="availableOperation.id"
      :label="availableOperation.operation"
      :value="availableOperation.id" />
  </el-select>
</template>
