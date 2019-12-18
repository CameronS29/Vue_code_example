<script>
  import { numeric, requiredIf } from 'vuelidate/lib/validators';

  import notZeroIf from '../../../../../../validators/notZeroIf';
  import QuantityInput from '../../../../../fields/QuantityInput.vue';
  import Icon from '../../../../../Common/Icon.vue';

  export default {
    props: {
      colSpan: {
        type: Number,
        default: 1,
      },

      /**
       * Applicable with .sync modifier
       */
      weight: {
        type: Number,
        default: null,
      },

      /**
       * Applicable with .sync modifier
       */
      count: {
        type: Number,
        default: null,
      },

      disabled: {
        type: Boolean,
        default: false,
      },
    },

    components: {
      QuantityInput,
      Icon,
    },

    data() {
      return {
        showFields: false,
      };
    },

    computed: {
      showButton() {
        return (
          !this.showFields
          && this.weight === null
          && this.count === null
        );
      },

      titleSpan() {
        return 2;
      },

      inputSpan() {
        return this.colSpan - this.titleSpan - 1;
      },
    },

    methods: {
      addExtraBag() {
        this.showFields = true;
      },

      setExtraBag(value) {
        this.$emit('update:weight', value);
      },

      setExtraBagCount(value) {
        this.$emit('update:count', value);
      },

      clearExtra() {
        this.showFields = false;
        this.setExtraBag(null);
        this.setExtraBagCount(null);
      },
    },

    validations: {
      weight: {
        required: notZeroIf('count'),
        numeric,
      },
      count: {
        notZeroIf: notZeroIf('weight'),
        numeric,
      },
    },
  };
</script>

<template>
  <tbody class="wb-extra-bag">
  <tr v-if="showButton" class="passenger-table__row">
    <td class="wb-extra-bag_add passenger-table__field" :colspan="colSpan">
      <button class="wb-extra-bag__button" @click="addExtraBag" :disabled="disabled">
        <i class="fa fa-suitcase" aria-hidden="true"></i>&nbsp;
        Add Extra Bags
      </button>
    </td>
  </tr>
  <tr class="passenger-table__row" v-else>
    <td :colspan="titleSpan" class="passenger-table__field" />
    <td class="passenger-table__field wb-extra-bag__caption">
      Extra Bags
    </td>
    <td class="passenger-table__field" :colspan="inputSpan" :class="{ error: $v.weight.$invalid || $v.count.$invalid }">
      <quantity-input
        :value="weight"
        :quantity="count"
        @update:value="setExtraBag"
        @update:quantity="setExtraBagCount"
        :disabled="disabled"
      ></quantity-input>
      <span class="form-group__message" v-if="!$v.weight.required">Bags weight is required</span>
      <span class="form-group__message" v-if="!$v.weight.numeric">Bags weight should be a number</span>
      <span class="form-group__message" v-if="!$v.count.notZeroIf">Bags quantity required</span>
      <span class="form-group__message" v-if="!$v.count.numeric">Bags quantity should be a number</span>
    </td>
    <td class="passenger-table__field passenger-table__button">
      <icon
        class="wb-extra-bag__button-icon"
        glyph="times-circle"
        title="Remove extra bags"
        size="lg"
        @click="clearExtra"
      />
    </td>
  </tr>
  </tbody>
</template>

<style lang="scss" src="../../../Common/Passengers/extra-bags.scss"></style>
<style lang="scss">
  .wb-extra-bag__button-icon {
    cursor: pointer;
    opacity: 0.7;

    &:hover,
    &:focus {
      opacity: 0.85;
    }

    &:active {
      opacity: 1;
    }

    &[disabled] {
      opacity: 0.4 !important;
      cursor: not-allowed;
    }
  }
</style>
