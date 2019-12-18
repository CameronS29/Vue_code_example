<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

  import Switcher from './Switcher.vue';

  export default {
    props: {
      group: {
        type: Object,
        required: true,
      },
    },
    components: {
      Switcher,
    },
    computed: {
      groupModel: {
        get() {
          return this.enabledTypesCount === this.group.types.length;
        },
        set() {
          this.toggleTypes({
            ids: this.group.types.map(type => type.id),
            flag: !this.groupModel,
          });
        }
      },
      enabledTypesCount() {
        return this.group.types.filter(type => type.enabled).length;
      },
      isIndeterminate() {
        return (this.enabledTypesCount > 0) && (this.enabledTypesCount < this.group.types.length);
      }
    },
    methods: {
      ...mapMutations('scheduling/crewCurrency', [
        'toggleTypes',
      ]),
    }
  };
</script>


<template>
  <div class="crew-currency-type-group">
    <el-checkbox :indeterminate="isIndeterminate" v-model="groupModel" />
    <div class="crew-currency-type-group__types">
      <switcher :key="type.id" :type="type" v-for="type in group.types" />
    </div>
  </div>
</template>


<style lang="scss">
  .crew-currency-type-group {
    display: flex;
    align-items: center;
    margin: 0 20px 10px 0;
    .el-checkbox {
      margin-bottom: 0;
    }
    &__types {
      display: flex;
      flex-flow: row wrap;
      padding: 5px;
      background: #fff;
      margin-left: 10px;
      border-radius: 5px;
    }
  }
</style>
