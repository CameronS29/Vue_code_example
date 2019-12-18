<script>
  import { mapGetters, mapMutations } from 'vuex';
  import { sortBy } from 'lodash';

  import HorizontalScrollable from 'Common/HorizontalScrollable.vue';
  import SwitcherGroup from './SwitcherGroup.vue';

  export default {
    components: {
      HorizontalScrollable,
      SwitcherGroup,
    },
    computed: {
      ...mapGetters('scheduling/crewCurrency', [
        'types',
        'groupedTypes',
      ]),
      sortedGroups() {
        return sortBy(this.groupedTypes, ({ types }) => types.length);
      },

      groupModel: {
        get() {
          return this.enabledTypesCount === this.types.length;
        },
        set() {
          this.toggleTypes({
            ids: this.types.map(type => type.id),
            flag: !this.groupModel,
          });
        },
      },
      enabledTypesCount() {
        return this.types.filter(type => type.enabled).length;
      },
      isIndeterminate() {
        return (this.enabledTypesCount > 0) && (this.enabledTypesCount < this.types.length);
      },
    },
    methods: {
      ...mapMutations('scheduling/crewCurrency', [
        'toggleTypes',
      ]),
    },
  };
</script>

<template>
  <div>
    <portal to="crew-currency">
      <div class="crew-currency-columns__all">
        <el-checkbox label="All Currency Types" size="small" :indeterminate="isIndeterminate" v-model="groupModel" />
      </div>
    </portal>

    <horizontal-scrollable fade-color="#F3F3F4">
      <div class="crew-currency-columns">
        <switcher-group :key="group.group.id" :group="group" v-for="group in sortedGroups" />
      </div>
    </horizontal-scrollable>
  </div>

</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .crew-currency-columns {
    display: flex;
    flex-flow: row wrap;
    width: 2500px;

    &__all {
      margin-right: 15px;
      padding-right: 15px;
      border-right: 1px solid rgba(195, 195, 195, 0.6);

      .el-checkbox {
        font-weight: bold;

      }
    }
  }
</style>
