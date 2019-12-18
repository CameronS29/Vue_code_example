<script>
  import { mapActions } from 'vuex';
  import { debounce } from 'lodash';
  import { handlePatch } from './utils';


  export default {
    props: { arm: Object },

    methods: {
      ...mapActions('wb/aircraft-params', ['patchArm']),
      transformValue(value) { return { id: this.arm.id, value } },

      handleInput: handlePatch('patchArm', 'transformValue'),
    },
  };
</script>

<template>
  <tr class="wb-admin-ac-arm">
    <td class="wb-admin-ac-arm__type">{{ arm.item_description }}</td>
    <td class="wb-admin-ac-arm__value">
      <el-input size="mini" :value="arm.value" @input="handleInput" />
    </td>
  </tr>
</template>

<style lang="scss">
  .wb-admin-ac-arm {
    td { padding: 2px; }
    &:hover td { background: #f0f0f0; }
  }
</style>
