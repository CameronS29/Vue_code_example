<script>
  import { mapActions } from 'vuex';
  import { debounce } from 'lodash';

  import Icon from 'Common/Icon.vue';
  import { handlePatch } from './utils';


  export default {
    props: {
      fuelLoad: Object,
      disabled: {
        type: Boolean,
        default: false,
      },
    },

    components: { Icon },

    methods: {
      ...mapActions('wb/aircraft-params', ['patchFuelLoad', 'deleteFuelLoad',]),

      transformWeight(value) { return { id: this.fuelLoad.id, data: { fuel_weight: value } }; },
      transformMoment(value) { return { id: this.fuelLoad.id, data: { moment: value } }; },


      handleWeightChange: handlePatch('patchFuelLoad', 'transformWeight'),
      handleMomentChange: handlePatch('patchFuelLoad', 'transformMoment'),

      handleRemove() {
        this.$confirm('Are you really want to remove this Fuel Loading Parameter', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          this.deleteFuelLoad(this.fuelLoad.id).catch(e => {
            this.$notify.error({
              title: 'Error',
              message: 'Something went wrong!'
            });
          });
        });
      },
    },
  };
</script>

<template>
  <tr class="wb-admin-ac-fuel">
    <td>
      <el-input
        size="mini"
        :disabled="disabled"
        :value="fuelLoad.fuel_weight"
        @input="handleWeightChange" />
    </td>

    <td>
      <el-input
        size="mini"
        :disabled="disabled"
        :value="fuelLoad.moment"
        @input="handleMomentChange" />
    </td>

    <td>
      <span
        v-if="!disabled"
        class="wb-admin-ac-fuel__remove"
        title="Remove Fuel Load Entry"
        @click="handleRemove"
      >
        <icon glyph="times-circle-o" size="lg" />
      </span>
    </td>
  </tr>
</template>

<style lang="scss">
  .wb-admin-ac-fuel {
    td { padding: 2px; }
    &:hover td { background: #f0f0f0; }
    &__remove { cursor: pointer; }
  }
</style>
