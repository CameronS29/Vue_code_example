<script>
  import { mapState, mapActions, mapGetters } from 'vuex';


  export default {
    created() {
      if (!this.availableAircrafts.length) {
        this.getAllOptions();
      }
    },
    props: {
      value: Array,
      controlProps: Object,
    },
    computed: {
      ...mapGetters('wb', ['availableAircrafts']),

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
      v-for="aircraft in availableAircrafts"
      :key="aircraft.id"
      :label="aircraft.registration"
      :value="aircraft.id" />
  </el-select>
</template>
