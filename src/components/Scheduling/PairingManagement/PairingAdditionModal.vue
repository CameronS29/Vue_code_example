<script>
  import { mapState, mapActions, mapMutations } from 'vuex';
  import { keys } from 'lodash';
  import { DateTime } from 'luxon';

  import Modal from 'Common/Modal';
  import Block from 'Common/Block.vue';
  import ButtonEl from 'Common/Button.vue';
  import GlobalError from 'Common/Form/GlobalError.vue';
  import Group from 'Common/Form/Group.vue';
  import VerticalForm from 'Common/Form/VerticalForm.vue';
  import TextField from 'Common/Form/Fields/TextField.vue';
  import BaseField from 'Common/Form/Fields/BaseCodeField.vue';
  import AirportField from 'Common/Form/Fields/AirportIATAField.vue';

  import {
    TOGGLE_PAIRING_ADDITION_MODAL,
    UPDATE_PAIR_FORM,
    RESET_PAIR_FORM,
  } from '../../../store/modules/scheduling/consts';
  import { mapFormTextField } from '../../../store/helpers/forms';
  import { required } from 'vuelidate/lib/validators';
  import { pairingsTableNamespace } from '../../../store/modules/scheduling/pairings';


  export default {
    props: {
      defaultDate: Date,
    },

    components: {
      Block,
      ButtonEl,
      Modal,
      TextField,
      VerticalForm,
      Group,
      GlobalError,
      AirportField,
      BaseField,
    },

    created() {
      this.date = this.defaultDate;
    },

    computed: {
      ...mapFormTextField(
        'scheduling/pairings/update-form/form',
        `scheduling/pairings/update-form/${UPDATE_PAIR_FORM}`,
        ['id', 'name', 'date', 'base', 'station'],
      ),

      ...mapState('scheduling/pairings', [
        'isPairingAdditionModalActive',
      ]),

      pair() {
        return {
          id: this.id,
          name: this.name,
          date: DateTime.fromJSDate(this.date)
            .toISODate(),
          base: this.base,
          station: this.station,
        };
      },

      pickerOptions() {
        return {
          disabledDate: (value) => {
            const { year, month } = DateTime.fromJSDate(value);
            const { year: activeYear, month: activeMonth } =
              DateTime.fromJSDate(this.defaultDate);
            return !(year === activeYear && month === activeMonth);
          },
        };
      },

      title() {
        return this.id ? 'Update shift' : 'Add new shift';
      },
    },

    methods: {
      ...mapMutations('scheduling/pairings', [TOGGLE_PAIRING_ADDITION_MODAL]),
      ...mapMutations('scheduling/pairings/update-form', [RESET_PAIR_FORM]),
      ...mapActions('scheduling/pairings', ['addPair', 'updatePair']),

      ...mapActions(pairingsTableNamespace, {
        refreshPairingTable: 'refreshResults',
      }),

      close() {
        this[TOGGLE_PAIRING_ADDITION_MODAL](false);
        this.resetFrom();
      },

      resetFrom() {
        this[RESET_PAIR_FORM]();
        this.$v.$reset();
      },

      async handleSubmit() {
        this.$v.$touch();
        if (this.$v.$invalid) {
          return;
        }

        if (this.pair.id) {
          await this.updatePair(this.pair);
        } else {
          await this.addPair(this.pair);
        }

        this.close();
        this.refreshPairingTable();
      },
    },

    globalErrors: ['globalErrorExample'],

    validations: {
      name: { required },
      date: { required },
      base: { required },
      station: { required },
    },

    watch: {
      isPairingAdditionModalActive() {
        this.date = this.defaultDate;
      },
    },
  };
</script>

<template>
  <modal :show="isPairingAdditionModalActive" @close="close">
    <div>
      <h2>{{ title }}</h2>
      <vertical-form>
        <global-error :validation-data="$v" />

        <group label="Name" :validation-data="$v.name">
          <text-field v-model="name" />
        </group>

        <group label="Date" :validation-data="$v.date">
          <el-date-picker
            v-model="date"
            :default-value="defaultDate"
            :picker-options="pickerOptions"
            class="date-picker"
          />
        </group>

        <group label="Base" :validation-data="$v.base">
          <base-field :control-props="{ multiple: false }" v-model="base" />
        </group>

        <group label="Station" :validation-data="$v.station">
          <airport-field :control-props="{ multiple: false }" v-model="station" />
        </group>

        <group class="submit-wrapper">
          <button-el label="Submit" @click="handleSubmit" />
        </group>
      </vertical-form>
    </div>
  </modal>
</template>

<style scoped>
  h2 {
    margin: 10px 21px 20px;
  }

  .submit-wrapper {
    display: flex;
    justify-content: flex-end;
    margin: 20px 0 10px;
  }

</style>
