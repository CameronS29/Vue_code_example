<script>
  import { mapGetters } from 'vuex';
  import { Switch } from 'element-ui';
  import trueIf from '../../../../../validators/trueIf'
  import { flag } from 'utils/permissions';

  export default {
    name: 'SecuritySearchPerformed',
    components: {
      SwitchEl: Switch,
    },

    computed: {
      ...mapGetters('wb', ['validate', 'log', 'securityRestriction']),
      securitySearchPeformed() {
        return this.log.security_search_performed;
      },
      securitySearchId() {
        return this.log.security_search_id;
      },
      canViewLog() {
        return this.securitySearchId && flag('show_security_dashboard', 'show_security_form')(this.$store);
      },
      logRouterName() {
        if (flag('show_security_dashboard')(this.$store)) {
          return 'security_view';
        }

        if (flag('show_security_form')(this.$store)) {
          return 'security_confirm';
        }
      },
      canSubmit() {
        return !this.securitySearchPeformed && flag('show_security_form')(this.$store);
      }
    },

    validations: {
      securitySearchPeformed: {
        required: trueIf('securityRestriction'),
      },
    },
  };
</script>

<template>
  <div class="panel panel-body col-sm-12 wb-security-check" :class="{ error: $v.$invalid && validate }">
    <div class="wb-security-check__box">
      <switch-el class="wb-security-check__mark" v-model="securitySearchPeformed" disabled />
      <div class="wb-security-check__description">
        This flight requires a security search prior to departure.
        Security search log should be submitted to complete this WB log.
      </div>
    </div>
    <div class="alert alert-danger error wb-fuel-alert" role="alert" v-if="$v.$invalid && validate">
      Security search log should be submitted
    </div>
    <div v-if="canViewLog">
      <br/>
      <router-link
        :to="{ name: logRouterName, params: { id: securitySearchId }}"
      >
        <el-button
          size="mini"
          type="primary">
          View on Search Log
        </el-button>
      </router-link>
    </div>

    <div v-if="canSubmit">
      <br/>
      <router-link
        :to="{ name: 'security_form', query: { fromWB: true}}"
      >
        <el-button
          size="mini"
          type="primary">
          Submit Security Search Form
        </el-button>
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .wb-security-check {
    margin-top: 20px;

    &__box {
      display: flex;
    }

    &__mark {
      align-self: center;
    }

    &__description {
      margin-left: 15px;
      cursor: pointer;
      user-select: none;
    }
  }
</style>
