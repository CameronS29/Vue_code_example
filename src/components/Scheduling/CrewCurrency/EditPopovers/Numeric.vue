<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
  import { DateTime } from 'luxon';

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
    data() {
      return {
        value: null,
      };
    },
    computed: {
      ...mapState('scheduling/crewCurrency', [
        'editPopover',
      ]),
      propName() {
        return this.type.currency_meta.key_name;
      },
      editable() {
        return this.type.currency_meta.editable;
      },
      propValue() {
        return this.pilot.pilot.currency[this.propName];
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
        if (this.editable) {
          this.setEditPopoverProps({
            pilotId: this.pilot.id,
            key: this.propName,
          });
        }
      },
      clearEditProps() {
        this.clearEditPopoverProps();
      },
      handleSave() {
        this.patchProp({
          pilotId: this.pilot.id,
          key: this.propName,
          value: DateTime.fromJSDate(this.date)
            .toISODate(),
        });
      },
    },
  };
</script>

<template>
  <popover
    :element-props="{ width: 300 }"
    placeholder-class="currency-boolean__pop-placeholder" @hide="clearEditProps">
    <div class="currency-numeric__next">
      <div class="currency-numeric__left">New record</div>
      <div class="currency-numeric__right">
        <el-input v-model="value" />
      </div>
    </div>
    <el-button class="currency-numeric__submit" size="mini" @click="handleSave" type="primary">Save</el-button>
  </popover>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .currency-numeric {
    position: relative;
    display: inline-block;

    &__next {
      font-size: 12px;
      margin-bottom: 10px;
      display: flex;
    }

    &__left {
      flex: 0 0 100px;
    }

    &__right {
      flex: 1 1;
    }

    &__submit {
      margin-left: 100px;
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
