<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

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
  <popover
    :element-props="{ width: 50 }"
    placeholder-class="currency-boolean__pop-placeholder" @hide="clearEditProps">
    <div class="currency-boolean__switcher">
      <el-switch v-model="updateModel" />
    </div>
  </popover>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .currency-boolean {
    position: relative;
    display: inline-block;

    &__switcher {
      display: flex;
      justify-content: center;
    }

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
