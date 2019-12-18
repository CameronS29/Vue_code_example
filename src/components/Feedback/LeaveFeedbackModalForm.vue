<script>
  import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
  import { DateTime } from 'luxon';

  import ButtonEl from 'Common/Button';
  import Group from "Common/Form/Group";
  import VerticalForm from "Common/Form/VerticalForm";
  import TextAreaField from "Common/Form/Fields/TextAreaField";
  import { mapFormTextField } from "store/helpers/forms";
  import { required, requiredIf } from 'vuelidate/lib/validators';
  import { UPDATE_PLAIN_MESSAGE_FORM } from 'store/modules/feedback';

  export default {
    components: {
      ButtonEl,
      TextAreaField,
      VerticalForm,
      Group,
    },
    computed: {
      ...mapFormTextField('feedback/plainMessageForm', `feedback/${UPDATE_PLAIN_MESSAGE_FORM}`, [
        'message'
      ]),
    },
    methods: {
      handleSubmit() {
        this.$v.$touch();
        if (!this.$v.$invalid) this.$emit('submit');
      },
    },
    validations: {
      message: {
        required,
      }
    }
  };
</script>

<template>
  <vertical-form class="leave-feedback-modal-form">
    <group label="Feedback message" :validation-data="$v.message">
      <text-area-field class="leave-feedback-modal-form__text-area" v-model="message" />
    </group>
    <group>
      <button-el @click="handleSubmit">Submit</button-el>
    </group>
  </vertical-form>
</template>

<style lang="scss">

  .leave-feedback-modal-form {
    &__text-area {
      textarea {
        height: 130px;
      }
    }
  }
</style>
