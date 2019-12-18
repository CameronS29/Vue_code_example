<script>
  import QuantityField from './QuantityField.vue';

  export default {
    props: {
      colSpan: {
        type: Number,
        default: 1,
      },

      weight: {
        type: Number,
        default: null,
      },

      count: {
        type: Number,
        default: null,
      },
    },

    components: {
      QuantityField,
    },

    computed: {
      titleSpan() {
        return 2;
      },

      inputSpan() {
        return this.colSpan - (this.titleSpan + 2);
      },

      isVisible() {
        return this.weight !== null && this.count !== null;
      },
    },
  };
</script>

<template>
  <tbody class="wb-extra-bag" v-if="isVisible">
  <tr class="passenger-table__row">
    <td class="wb-extra-bag__read-only" :colspan="titleSpan" />
    <td class="wb-extra-bag__caption wb-extra-bag__read-only">
      Extra Bags
    </td>
    <td class="wb-extra-bag__read-only" />
    <td
      class="passenger-table__extra-count wb-extra-bag__read-only"
      :colspan="inputSpan"
    >
      <quantity-field :value="weight" :count="count"></quantity-field>
    </td>
  </tr>
  </tbody>
</template>

<style lang="scss" src="../../../Common/Passengers/extra-bags.scss"></style>

