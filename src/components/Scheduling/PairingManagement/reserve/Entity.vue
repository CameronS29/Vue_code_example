<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { required } from 'vuelidate/lib/validators';

  import ButtonEl from 'Common/Button.vue';
  import Block from 'Common/Block.vue';
  import Group from 'Common/Form/Group.vue';
  import VerticalForm from 'Common/Form/VerticalForm.vue';
  import TextField from 'Common/Form/Fields/TextField.vue';
  import DateTimeField from 'Common/Form/Fields/DateTimeField.vue';
  import SelectField from 'Common/Form/Fields/SelectField.vue';
  import GlobalError from 'Common/Form/GlobalError.vue';
  import { mapFormTextField } from 'store/helpers/forms';
  import { tableNamespaceByTypeId } from 'store/modules/scheduling/shifts/reserve';
  import * as consts from 'store/modules/scheduling/consts';

  export default {
    created() {
      this.getAllAvailableAirports();
    },
    components: {
      Block,
      ButtonEl,
      TextField,
      DateTimeField,
      SelectField,
      VerticalForm,
      Group,
      GlobalError,
    },
    computed: {
      ...mapGetters('airports', ['pilotBases']),
      ...mapGetters('scheduling/pairings', [
        'activeTabName',
        'activeReserveTypeId',
      ]),
      ...mapFormTextField(
        'scheduling/pairings/reserve/editableReserveShift',
        'scheduling/pairings/reserve/UPDATE_RESERVE_SHIFT',
        ['shortcut', 'name', 'duty_on', 'duty_off', 'base'],
      ),
      ...mapState('scheduling/pairings/reserve', [
        'loading',
        'editableReserveShift',
      ]),

      timeAttributes() {
        return { format: 'M/d/yyyy HH:mm' };
      },

      baseSelectAttributes() {
        return { filterable: true };
      },

      baseOptions() {
        return this.pilotBases.map(({ id, iata }) => ({
          label: iata,
          value: id.toString(),
        }));
      },
    },

    methods: {
      ...mapActions('airports', ['getAllAvailableAirports']),
      ...mapMutations('scheduling/pairings/reserve', [consts.SET_EDITABLE_RESERVE_SHIFT]),
      ...mapActions('scheduling/pairings/reserve', ['saveReserveShift']),

      async refreshTable() {
        return this.$store.dispatch(`${tableNamespaceByTypeId(this.activeReserveTypeId)}/refreshResults`);
      },

      async handleSave() {
        this.$v.$touch();

        if (!this.$v.$invalid) {
          await this.saveReserveShift();
          await this.refreshTable();
        }
      },

      close() {
        this[consts.SET_EDITABLE_RESERVE_SHIFT](null);
      },
    },

    fieldErrors: {
      lessThanDutyOn: () => 'Duty Off can\'t be less than Duty On',
    },

    validations: {
      name: { required },
      shortcut: { required },
      duty_on: { required },
      duty_off: {
        required,
        lessThanDutyOn(value) {
          return value >= this.duty_on;
        },
      },
      base: { required },
    },
    globalErrors: ['lessThanDutyOn'],

    watch: {
      editableReserveShift() {
        this.$v.$reset();
      },
    },
  };
</script>

<template>
  <block class="reserve-shift-entity" v-loading="loading">
    <div class="reserve-shift-entity__header" slot="title">
      {{ editableReserveShift.shortcut }} {{ activeTabName }} shift
      <el-button class="reserve-shift-entity__close" size="mini" round @click="close">Close</el-button>
    </div>

    <vertical-form>
      <global-error :validation-data="$v" />

      <div class="reserve-shift-entity__row reserve-shift-entity__row_first">
        <group label="Name" :validation-data="$v.name" class="reserve-shift-entity__name-group">
          <text-field v-model="name" />
        </group>
        <group label="Shortcut" :validation-data="$v.shortcut" class="reserve-shift-entity__shortcut-group">
          <text-field v-model="shortcut" />
        </group>
      </div>

      <div class="reserve-shift-entity__row">
        <group label="Duty On" :validation-data="$v.duty_on">
          <date-time-field :attributes="timeAttributes"
                           timezone="UTC"
                           v-model="duty_on"
                           class="reserve-shift-entity__time-picker" />
        </group>
        <group label="Duty Off" :validation-data="$v.duty_off">
          <date-time-field :attributes="timeAttributes"
                           timezone="UTC"
                           v-model="duty_off"
                           class="reserve-shift-entity__time-picker" />
        </group>
        <group label="Base" :validation-data="$v.base">
          <select-field :attributes="{ filterable: true }"
                        :options="baseOptions"
                        v-model="base"
                        class="reserve-shift-entity__base-picker" />
        </group>
      </div>

      <group>
        <button-el @click="handleSave" label="Save" />
      </group>
    </vertical-form>
  </block>
</template>

<style lang="scss">
  .reserve-shift-entity {
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    &__row {
      display: flex;
      flex-flow: row wrap;
      &_first {
        margin: 20px 0 10px;
      }
    }
    &__name-group {
      flex: 1 1;
    }
    &__shortcut-group {
      flex: 0 0 120px;
    }
    &__time-picker {

    }
    &__base-picker {
      max-width: 100px;
    }
  }
</style>
