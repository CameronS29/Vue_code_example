<script>
  import filter from 'lodash/filter';
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import { mapFormTextField, mapFormDateField} from '../../../../../store/helpers/forms';
  import { Radio } from 'element-ui';
  import Group from "Common/Form/Group.vue";
  import Collapse from 'Common/Collapse.vue';
  import UnscheduledButton from './UnscheduledButton.vue';

  export default {
    data() {
      return {
        operation: null
      }
    },
    components: {
      Radio,
      Group,
      Collapse,
      UnscheduledButton,
    },
    computed: {
      ...mapGetters('pilotManifest', ['operations',]),

      availableOpers() {
        return filter(this.operations, (o)=>o.id !== 1);
      }
    }
  };
</script>
<template>
  <collapse title="Unscheduled Flight" gutterColor="#d9534f">
    <group label="Select the option that best applies:" class="unscheduled-group" >
      <div v-for="oper in availableOpers">
        <el-radio v-model="operation" :label="oper.name" class="unscheduled-group__radio">
          {{oper.name}}
        </el-radio>
      </div>
    </group>
    <unscheduled-button :operation="operation" />
  </collapse>
</template>

<style lang="scss">
  .unscheduled-group {
    padding: 15px;

    .btq-form__label {
      margin-bottom: 20px;
    }

    &__radio {
      padding: 10px;
    }
  }
</style>
