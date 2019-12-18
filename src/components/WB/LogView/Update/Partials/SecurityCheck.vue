<script>
  import { mapGetters } from 'vuex';
  import { Switch } from 'element-ui';
  import updateLogMixin, { logProperty } from './updateLogMixin';

  import trueIf from '../../../../../validators/trueIf'

  export default {
    name: 'SecurityCheck',
    mixins: [updateLogMixin],

    components: {
      SwitchEl: Switch,
    },

    computed: {
      ...mapGetters('wb', ['validate']),
      securityChecked: logProperty('security_checked'),
      securityAware: logProperty('security_check_aware'),
    },

    methods: {
      toggleCheckMark() {
        this.securityChecked = !this.securityChecked;
      },
    },

    validations: {
      securityChecked: {
        required: trueIf('securityAware'),
      },
    },
  };
</script>

<template>
  <div class="panel panel-body col-sm-12 wb-security-check" :class="{ error: $v.$invalid && validate }">
    <div class="wb-security-check__box" v-loading="isLoading">
      <switch-el class="wb-security-check__mark" v-model="securityChecked" />
      <div class="wb-security-check__description" @click="toggleCheckMark">
        This flight requires a security search prior to departure.
        By checking this box, I certify that the security search has been conducted prior to the departure of this flight as per company procedures.
      </div>
    </div>
    <div class="alert alert-danger error wb-fuel-alert" role="alert" v-if="$v.$invalid && validate">
      You should perform operations above before pinning this log.
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
