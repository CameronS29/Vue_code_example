<script>
  import { Input } from 'element-ui';
  import ThrottledInput from 'Common/ThrottledInput.vue';

  export default {
    props: {
      value: String,
      elementUiStyle: {
        default: false,
        type: Boolean,
      },
    },

    components: {
      Input,
      ThrottledInput,
    },

    methods: {
      handleInput(value) {
        this.$emit('input', value);
      },
    },
  };
</script>

<template>
  <throttled-input
    :component="$options.components.Input"
    class="SearchInput__input"
    placeholder="Search..."
    size="small"
    prefix-icon="el-icon-search"
    :value="value"
    @input="handleInput"
    :delay="800"
    :clearable="true"
  />
</template>
