<script>
  import updateManifestMixin from './updateManifestMixin';
  import {mapGetters} from 'vuex';
  import {Row, Col} from 'element-ui';
  import Group from "Common/Form/Group.vue";
  import FireCheck from '../../../form/FireCheck.vue';
  import VorCheck from '../../../form/VorCheck.vue';
  import {required, requiredIf} from 'vuelidate/lib/validators';
  export default {
    mixins: [updateManifestMixin],
    components: {
      ElRow: Row,
      ElCol: Col,
      FireCheck,
      VorCheck,
      Group,
    },
    computed: {
      ...mapGetters("manifest/fireCheck", {
        "fireCheckConfirmed": "isValid"
      }),
      ...mapGetters("manifest/vorCheck", {
        "vorCheckConfirmed": "isValid"
      }),

    },
    validations: {
      fireCheckConfirmed: {
        required(confirmed) { return this.validateTryCount > 0 && confirmed},
      },
      vorCheckConfirmed: {
        required(confirmed) { return this.validateTryCount > 0 && confirmed},
      }
    },
  };
</script>

<template>
  <el-row :gutter="30" class="edit-manifest-vor-fire-check">
    <el-col :sm="12" :xs="24">
      <group :error="$v.vorCheckConfirmed.$error" :no-padding="true">
        <div slot="errors" v-if="!$v.vorCheckConfirmed.required">
          VOR Check should be confirmed
        </div>
        <vor-check
          :manifestId="manifest.id"
          :picInitial="manifest.pic_initials"
          :status="manifest.vor_status"
          :objectId="manifest.vor_confirmation"></vor-check>
      </group>
    </el-col>
    <el-col :sm="12" :xs="24">
      <group :error="$v.fireCheckConfirmed.$error" :no-padding="true">
        <div slot="errors" v-if="!$v.fireCheckConfirmed.required">
          Fire Extinguisher Check should be confirmed
        </div>
        <fire-check
          :manifestId="manifest.id"
          :picInitial="manifest.pic_initials"
          :status="manifest.fire_status"
          :objectId="manifest.fire_confirmation"></fire-check>
      </group>
    </el-col>
  </el-row>
</template>

<style lang="scss">
  .edit-manifest-vor-fire-check {
    margin-top: 10px;
  }
</style>
