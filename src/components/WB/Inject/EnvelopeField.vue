<script>
  import { mapActions } from 'vuex';
  import { debounce } from 'lodash';

  import Icon from 'Common/Icon.vue';
  import { handlePatch } from './utils';


  export default {
    props: {
      envelope: Object,
      disabled: {
        type: Boolean,
        default: false,
      },
    },

    components: { Icon },

    methods: {
      ...mapActions('wb/aircraft-params', ['patchEnvelope', 'deleteEnvelope']),

      transformCG(value) { return { id: this.envelope.id, data: { center_gravity: value } }; },
      transformWeight(value) { return { id: this.envelope.id, data: { center_gravity_weight: value } }; },
      transformTrim(value) { return { id: this.envelope.id, data: { trim_weight: value } }; },
      transformZeroFuel(value) { return { id: this.envelope.id, data: { zero_fuel: value } }; },

      handleCGChange: handlePatch('patchEnvelope', 'transformCG'),
      handleWeightChange: handlePatch('patchEnvelope', 'transformWeight'),
      handleTrimChange: handlePatch('patchEnvelope', 'transformTrim'),
      handleZeroFuelChange: handlePatch('patchEnvelope', 'transformZeroFuel'),

      handleRemove() {
        this.$confirm('Are you really want to remove this Envelope Parameter', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          this.deleteEnvelope(this.envelope.id).catch(e => {
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
  <tr class="wb-admin-ac-envelope">
    <td>
      <el-input
        size="mini"
        :disabled="disabled"
        :value="envelope.center_gravity"
        @input="handleCGChange"
      />
    </td>

    <td>
      <el-input
        size="mini"
        :disabled="disabled"
        :value="envelope.center_gravity_weight"
        @input="handleWeightChange"
      />
    </td>

    <td>
      <el-input
        size="mini"
        :disabled="disabled"
        :value="envelope.trim_weight"
        @input="handleTrimChange"
      />
    </td>

    <td>
      <el-input
        size="mini"
        :disabled="disabled"
        :value="envelope.zero_fuel"
        @input="handleZeroFuelChange"
      />
    </td>

    <td>
      <span
        v-if="!disabled"
        class="wb-admin-ac-envelope__remove"
        title="Remove Fuel Load Entry"
        @click="handleRemove"
      >
        <icon glyph="times-circle-o" size="lg"/>
      </span>
    </td>
  </tr>
</template>

<style lang="scss">
  .wb-admin-ac-envelope {
    td {
      padding: 2px;
    }
    &:hover td {
      background: #f0f0f0;
    }
    &__remove {
      cursor: pointer;
    }
  }
</style>
