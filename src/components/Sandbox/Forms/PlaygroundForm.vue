<script>
  import {mapGetters, mapActions} from 'vuex';
  import Button from "Common/Button.vue";
  import Block from "Common/Block.vue";
  import GlobalError from "Common/Form/GlobalError.vue";
  import Group from "Common/Form/Group.vue";
  import VerticalForm from "Common/Form/VerticalForm.vue";
  import TextField from "Common/Form/Fields/TextField.vue";
  import {mapFormTextField} from "../../../store/helpers/forms";
  import {required, requiredIf} from 'vuelidate/lib/validators';

  export default {
    components: {
      Block,
      TextField,
      VerticalForm,
      Group,
      GlobalError
    },
    computed: {
      ...mapFormTextField("sandbox/form/form", "sandbox/form/UPDATE_FORM", [
        'title'
      ]),
    },
    fieldErrors: {
      customError: (vm) => {
        return `Ooops! ${vm.title} is not a valid value. Try 'Nice' instead`;
      },
      globalErrorExample: (vm) => {
        return `Well, you're not lucky. ${vm.title} is not a valid value. Try 'Nice' instead`;
      },
    },
    globalErrors: ['globalErrorExample'],
    validations: {
      title: {
        required,
        customError(value) {
          return value === 'Nice';
        },
        globalErrorExample(value) {
          return value === 'Nice';
        }
      }
    }
  }
</script>

<template>
  <div>
    <block title="Form Playground">
      <vertical-form>
        <global-error :validation-data="$v"></global-error>
        <group label="Title" :validation-data="$v.title">
          <text-field v-model="title"></text-field>
        </group>
        <group>
          <button @click="$v.$touch()">Check</button>
        </group>
      </vertical-form>
    </block>
  </div>
</template>

