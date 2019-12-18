<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
  import {
    CURRENCY_BOOL_CONNECTED, CURRENCY_BOOLEAN, CURRENCY_PERIOD, CURRENCY_PERIODIC, CURRENCY_VARIATIVE,
    UNIT_DAY, UNIT_MONTH, UNIT_YEAR, UNIT_NAMES
  } from 'store/modules/scheduling/crewCurrency';

  export default {
    props: {
      type: {
        type: Object,
        required: true,
      },
    },
    computed: {
      model: {
        get() {
          return this.type.enabled;
        },
        set(flag) {
          this.toggleType({
            id: this.type.id,
            flag,
          });
        },
      },
      showBadge() {
        return (this.type.currency_type === CURRENCY_PERIODIC) && this.type.currency_meta.unit_range;
      },
      badgeText() {
        return `${this.type.currency_meta.unit_range} ${UNIT_NAMES[this.type.currency_meta.unit_type]}`;
      },
    },
    methods: {
      ...mapMutations('scheduling/crewCurrency', [
        'toggleType',
      ]),
    },
  };
</script>

<template>
  <div class="currency-type-switcher">
    <el-checkbox v-model="model" size="mini">
      <div class="currency-type-switcher__badge-wrapper">
        {{ type.currency_meta.verbose_name }}
        <span
          v-if="showBadge"
          class="currency-type-switcher__badge">{{ badgeText }}</span>
      </div>
    </el-checkbox>
  </div>
</template>

<style lang="scss">
  .currency-type-switcher {
    margin-right: 15px;
    .el-checkbox {
      margin-bottom: 0;
    }
    &__badge-wrapper {
      display: flex;
      align-items: center;
    }
    &__badge {
      padding: 0 5px;
      background-color: #057fd1;
      color: #fff;
      font-size: 9px;
      margin-left: 5px;
      border-radius: 1px;
    }
  }
</style>
