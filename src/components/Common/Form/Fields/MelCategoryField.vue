<script>
  import { mapState, mapActions, mapGetters } from 'vuex';


  export default {
    props: {
      value: Array,
      controlProps: Object,
    },
    computed: {
      ...mapState('aircraft/mel', ['categories']),

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
      v-for="(category, index) in categories"
      :key="index"
      :label="category"
      :value="index" />
  </el-select>
</template>
