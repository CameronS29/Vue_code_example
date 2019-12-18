<script>
  import { mapGetters, mapActions } from 'vuex';
  import Card from 'Common/Card.vue';
  import Loader from 'Common/Loader.vue';

  export default {
    name: 'ConfirmForm',

    components: {
      Card,
      Loader,
    },

    computed: {
      ...mapGetters('wb/confirmations', [
        'PICConfirmation',
      ]),

      ...mapGetters('wb/confirmation', [
        'pin',
        'initials',
        'errors',
        'hasErrors',
      ]),

      ...mapGetters('wb/confirmation', ['isLoading']),

      isLoaded() {
        return this.PICConfirmation !== undefined
          && this.PICConfirmation.author !== undefined;
      },

      pinModel: {
        get() { return this.pin; },
        set(value) { this.setPIN(value); },
      },

      initialsModel: {
        get() { return this.initials; },
        set(value) { this.setInitials(value); },
      },
    },

    methods: mapActions('wb/confirmation', [
      'setPIN',
      'setInitials',
      'pushConfirmation',
      'closeConfirmation',
    ]),
  };
</script>

<template>
  <card title="Confirmation">
    <div v-loading="isLoading">
      <div class="wb-confirm-confirmation__signature wb-confirmation-signature">
        <strong class="wb-confirmation-signature__title">PIC Signature:</strong>
        <loader :loaded="isLoaded" size="1x">
          <span v-if="isLoaded" class="wb-confirmation-signature__title">
            {{ PICConfirmation.author.first_name || 'Unknown' }}
            {{ PICConfirmation.author.last_name }}
          </span>
        </loader>
      </div>

      <div class="wb-confirm-confirmation__acknowledge wb-confirmation-acknowledge">
        <strong class="wb-confirmation-acknowledge__title">Dispatch Signature:</strong>
        <p class="wb-confirmation-acknowledge__text">
          I certify that I have reviewed this
          Weight and Balance log, and to the best of my knowledge,
          this information is correct.
        </p>
      </div>

      <div class="wb-confirm-confirmation__form wb-confirmation-form">
        <div class="alert alert-danger wb-confirm-form__alert" role="alert" v-if="hasErrors">
          <div v-for="(value, field) in errors" :key="field">
            <span class="sr-only">Error:</span>
            <strong v-if="field !== 'non_field_errors'">{{ field }}:</strong> {{ value.join('') }}
          </div>
        </div>

        <div class="wb-confirmation-form__fields">
          <input class="form-control wb-confirmation-form__input" type="password" name="pin" placeholder="PIN" v-model="pinModel" />
          <input class="form-control wb-confirmation-form__input" type="text" name="initials" placeholder="Initials" v-model="initialsModel" />
        </div>

        <div class="wb-confirmation-form__actions">
          <el-button type="danger" size="medium" @click="closeConfirmation">Cancel</el-button>
          <el-button type="primary" size="medium" @click="pushConfirmation" :disabled="isLoading">
            Confirm
          </el-button>
        </div>
      </div>
    </div>
  </card>
</template>

<style lang="scss" scoped>
  @import "../../../../../../scss/bs-variables";

  .wb-confirmation-signature {
    padding-bottom: 15px;
    margin-bottom: 15px;
    border-bottom: 1px solid $light-gray;
  }

  .wb-confirmation-acknowledge {
    &__text {
      padding-top: 6px;
      font-size: 1.1em;
    }
  }

  .wb-confirmation-form {
    padding-top: 20px;

    &__input {
      flex: 1 1 50%;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #D1DADE;
      border-radius: 3px;
      font-size: 18px;
      padding: 8px 11px 7px 11px;
      height: 39px;

      margin-right: 15px;
      &:last-child {
        margin-right: 0;
      }
    }

    &__alert {
      flex: 1 1 100%;
    }

    &__fields {
      flex: 1 1 100%;
      display: flex;
    }

    &__actions {
      flex: 1 1 100%;
      display: flex;
      justify-content: flex-end;
      margin-top: 15px;

      & > * { margin-left: 7px; }
    }
  }
</style>
