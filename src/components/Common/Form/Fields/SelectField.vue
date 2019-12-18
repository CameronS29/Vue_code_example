<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    props: ["value", "attributes", "options"],
    computed: {
      model: {
        get() {
          if (!this.value) return null;
          return this.value.toString();
        },
        set(value) {
          this.$emit("input", value);
        },
      }
    },
  };
</script>

<template>
  <div class="select-field">
    <el-select v-model="model" v-bind="attributes">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
    <slot></slot>
  </div>
</template>
