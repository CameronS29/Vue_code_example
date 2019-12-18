<script>
  import { mapActions, mapMutations, mapState } from 'vuex';

  import Popover from 'Common/Popover.vue';

  export default {
    components: {
      Popover,
    },
    props: {
      pilot: {
        type: Object,
        required: true,
      },
      type: {
        type: Object,
        required: true,
      },
    },
    computed: {
      ...mapState('scheduling/crewCurrency', [
        'editPopover',
      ]),
      value() {
        return this.pilot.pilot.currency[this.propName];
      },
      propName() {
        return this.type.currency_meta.key_name;
      },
      updateModel: {
        get() {
          return this.value;
        },
        set(value) {
          this.patchProp({
            pilotId: this.pilot.id,
            key: this.propName,
            value,
          });
        },
      },
    },
    methods: {
      ...mapMutations('scheduling/crewCurrency', [
        'setEditPopoverProps',
        'clearEditPopoverProps',
      ]),
      ...mapActions('scheduling/crewCurrency', [
        'patchProp',
      ]),
      handleClick() {
        this.setEditPopoverProps({
          pilotId: this.pilot.id,
          key: this.propName,
        });
      },
      clearEditProps() {
        this.clearEditPopoverProps();
      },
    },
  };
</script>

<template>
  <popover placeholder-class="currency-boolean__pop-placeholder" @hide="clearEditProps">
    <div class="currency-boolean__switcher">
      <el-select v-model="updateModel" clearable placeholder="Select">
        <el-option
          v-for="variant in type.currency_meta.variants"
          :key="variant"
          :label="variant"
          :value="variant" />
      </el-select>
    </div>
  </popover>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .currency-variative {
    position: relative;
    display: inline-block;

    &__pop-placeholder {
      pointer-events: none;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }
</style>
