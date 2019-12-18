<script>
  import { omit, flatten, map, isEmpty } from 'lodash';
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';

  import { CLEAR_ERRORS } from 'store/modules/wb/confirmation';
  import logBlockMixin from '../LogView/mixins/logBlockMixin';

  export default {
    mixins: [logBlockMixin],

    components: {
      Modal,
      Card,
    },

    computed: {
      ...mapGetters('wb/confirmation', [
        'initials',
        'pin',
        'roleDescription',
        'errors',
        'isLoading',
        'isDispatch',
      ]),

      pinModel: {
        get() { return this.pin; },
        set(value) { this.setPIN(value); },
      },

      initialsModel: {
        get() { return this.initials; },
        set(value) { this.setInitials(value); },
      },

      logErrors() {
        return flatten(map(omit(this.errors, ['pin', 'initials'])));
      },

      hasLogErrors() {
        return !isEmpty(this.logErrors);
      },
    },

    methods: {
      ...mapActions('wb/confirmation', [
        'setPIN',
        'setInitials',
        'pushConfirmation',
        'closeConfirmation',
      ]),

      ...mapMutations('wb/confirmation', [CLEAR_ERRORS]),

      scrollWindow() {
        if (this.errors.length === 0) {
          window.scrollBy(0, -window.scrollY);
        }
      },

      async submitConfirmation() {
        try {
          await this.pushConfirmation();
          this.scrollWindow();
        } catch (e) {
          this.$notify({
            type: 'error',
            title: 'Cannot confirm log',
            message: 'Check your network connection or try again later',
          });
        }
      },

      invalidClass(field) {
        return {
          'wb-confirmation-window__field_error': (field in this.errors),
        };
      },

      errorCaption(field) {
        return this.errors[field].join(' ');
      },

      handleErrorClear() {
        this[CLEAR_ERRORS]();
      },
    },
  };
</script>

<template>
  <modal :show="confirmOpened" :transparent="true" :show-close="false" @close="closeConfirmation">
    <card class="wb-confirmation-window" mode="dark">
      <div class="wb-confirmation-window__header">{{ roleDescription }} Confirmation</div>

      <card class="wb-confirmation-window__content">
        <div class="note" v-if="!isDispatch">
          I certify that I have flown this route within the last
          90 days and/or familiarized myself with all information required for safe operation of this flight.
        </div>
        <div class="note" v-else>
          I certify that I have reviewed this Weight and Balance log and to the best of my knowledge,
          its information is correct.
        </div>

        <el-alert v-if="hasLogErrors" @close="handleErrorClear" type="error" title="Errors">
          <div v-for="(err, idx) in logErrors" :key="idx">{{ err }}</div>
        </el-alert>

        <div class="wb-confirmation-window__form">
          <div class="wb-confirmation-window__field" :class="invalidClass('pin')">
            <el-input size="large"
                      placeholder="PIN"
                      type="password"
                      v-model="pinModel"
                      auto-complete="off"
                      :autofocus="true" />
            <span v-if="'pin' in errors">{{ errorCaption('pin') }}</span>
          </div>

          <div class="wb-confirmation-window__field" :class="invalidClass('initials')">
            <el-input size="large" placeholder="Initials" type="text" v-model="initialsModel" auto-complete="off" />
            <span v-if="'initials' in errors">{{ errorCaption('initials') }}</span>
          </div>
        </div>

        <div class="wb-confirmation-window__buttons">
          <el-button type="danger" size="medium" @click="closeConfirmation">
            Cancel
          </el-button>
          <el-button @click="submitConfirmation"
                     :loading="isLoading"
                     icon="el-icon-check"
                     type="primary"
                     size="medium">
            Confirm
          </el-button>
        </div>
      </card>
    </card>
  </modal>
</template>

<style lang="scss">
  @import "../../../../scss/bs-variables";

  .wb-confirmation-window {
    margin-left: auto;
    margin-right: auto;
    width: 465px;

    &__header {
      background: $window-confirm-header;
      color: $window-confirm-header-text;
      font-size: 22px;
      margin-bottom: 15px;
      font-weight: bold;
    }

    &__content {
      &.card {
        margin-bottom: 0;
      }

      .note {
        margin-bottom: 15px;
        font-size: 16px;
      }
    }

    &__form {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;

      margin: 0 -10px;
    }

    &__field {
      margin: 15px 10px;
      flex: 1 1 50%;

      &_error {
        color: $--color-danger;

        .el-input__inner {
          color: $--color-danger;
          border-color: $--color-danger;
        }
      }
    }

    &__buttons {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 0;
    }

    @media (max-width: $screen-xs-max) {
      width: 100%;
    }
  }
</style>
