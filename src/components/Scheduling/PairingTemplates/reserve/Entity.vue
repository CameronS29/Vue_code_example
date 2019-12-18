<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { required } from 'vuelidate/lib/validators';

  import ButtonEl from 'Common/Button.vue';
  import Block from 'Common/Block.vue';
  import Group from 'Common/Form/Group.vue';
  import VerticalForm from 'Common/Form/VerticalForm.vue';
  import TextField from 'Common/Form/Fields/TextField.vue';
  import TimeField from 'Common/Form/Fields/TimeField.vue';
  import SelectField from 'Common/Form/Fields/SelectField.vue';
  import GlobalError from 'Common/Form/GlobalError.vue';

  import { mapFormTextField } from '../../../../store/helpers/forms';
  import { tableNamespaceByTypeId } from '../../../../store/modules/scheduling/templates/reserve';

  import * as consts from '../../../../store/modules/scheduling/consts';
  import AffectedShift from '../../Common/AffectedShift.vue';

  export default {
    created() {
      this.getAllAvailableAirports();
    },

    components: {
      AffectedShift,
      Block,
      ButtonEl,
      TextField,
      TimeField,
      SelectField,
      VerticalForm,
      Group,
      GlobalError,
    },

    data() {
      return { patchDialogVisible: false };
    },

    computed: {
      ...mapGetters('airports', ['airports', 'pilotBases']),
      ...mapGetters('scheduling/pairingTemplates', [
        'activeTabName',
        'activeReserveTypeId',
      ]),
      ...mapFormTextField(
        'scheduling/pairingTemplates/reserve/editableReserveTemplate',
        'scheduling/pairingTemplates/reserve/UPDATE_RESERVE_TEMPLATE',
        ['shortcut', 'name', 'duty_on', 'duty_off', 'next_day_off', 'base'],
      ),
      ...mapState('scheduling/pairingTemplates/reserve', [
        'editableReserveTemplate',
        'editableTemplateChanges',
        'editableTemplateChanges',
        'changesLoading',
      ]),
      ...mapGetters('scheduling/pairingTemplates/reserve', [
        'hasTemplateChanges',
        'isLoading',
      ]),

      timeAttributes() {
        return { format: 'HH:mm' };
      },
      baseOptions() {
        return this.pilotBases.map(base => ({
          label: base.iata,
          value: base.id.toString(),
        }));
      },
    },
    methods: {
      ...mapActions('airports', ['getAllAvailableAirports']),
      ...mapMutations('scheduling/pairingTemplates/reserve', [
        consts.SET_EDITABLE_RESERVE_TEMPLATE,
      ]),

      ...mapActions('scheduling/pairingTemplates/reserve', [
        'saveReserveTemplate',
        'getTemplateChanges',
        'applyTemplateChanges',
      ]),

      async refreshTable() {
        return this.$store.dispatch(`${tableNamespaceByTypeId(this.activeReserveTypeId)}/refreshResults`);
      },

      async handleSave() {
        this.$v.$touch();

        if (!this.$v.$invalid) {
          await this.saveReserveTemplate();
          await this.refreshTable();
        }
      },

      async handleRetrieveChangesClick() {
        const { id } = this.editableReserveTemplate;
        this.getTemplateChanges(id);
        this.patchDialogVisible = true;
      },

      async handleApplyChangesClick() {
        const { id } = this.editableReserveTemplate;
        await this.applyTemplateChanges(id);
        this.patchDialogVisible = false;
      },

      close() {
        this[consts.SET_EDITABLE_RESERVE_TEMPLATE](null);
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
          return this.next_day_off || (value >= this.duty_on);
        },
      },
      base: { required },
    },
    globalErrors: ['lessThanDutyOn'],
    watch: {
      editableReserveTemplate() {
        this.$v.$reset();
      },
    },
  };
</script>

<template>
  <block class="reserve-template-entity" v-loading="isLoading">
    <el-dialog :title="`${editableReserveTemplate.shortcut} ${activeTabName} Changes`"
               :visible.sync="patchDialogVisible"
               width="35%">
      <div v-loading="changesLoading" class="reserve-template-entity__changes-list">
        <affected-shift v-for="(change, idx) in editableTemplateChanges"
                        :key="idx"
                        v-bind="change" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="patchDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleApplyChangesClick">Apply</el-button>
      </div>
    </el-dialog>

    <div class="reserve-template-entity__header" slot="title">
      {{ editableReserveTemplate.shortcut }} {{ activeTabName }} shift template
      <el-button class="reserve-template-entity__close" size="mini" round @click="close">Close</el-button>
    </div>

    <el-alert
      title="Changes detected."
      type="warning"
      v-if="hasTemplateChanges"
      :closable="false"
      show-icon
    >
      This template contains some unapplied changes.
      <el-button size="small" type="primary" @click="handleRetrieveChangesClick">
        Apply Them
      </el-button>
    </el-alert>

    <vertical-form>
      <global-error :validation-data="$v" />

      <div class="reserve-template-entity__row reserve-template-entity__row_first">
        <group label="Name" :validation-data="$v.name" class="reserve-template-entity__name-group">
          <text-field v-model="name" />
        </group>
        <group label="Shortcut" :validation-data="$v.shortcut" class="reserve-template-entity__shortcut-group">
          <text-field v-model="shortcut" />
        </group>
      </div>

      <div class="reserve-template-entity__row">
        <group label="Duty On" :validation-data="$v.duty_on">
          <time-field :attributes="timeAttributes" v-model="duty_on" class="reserve-template-entity__time-picker" />
        </group>
        <group label="Duty Off" :validation-data="$v.duty_off">
          <div class="reserve-template-entity__duty-off">
            <time-field :attributes="timeAttributes" v-model="duty_off" class="reserve-template-entity__time-picker" />
            <el-checkbox class="reserve-template-entity__plus-one" v-model="next_day_off">+1 day</el-checkbox>
          </div>
        </group>
        <group label="Base" :validation-data="$v.base">
          <select-field :attributes="{ filterable: true }"
                        :options="baseOptions"
                        v-model="base"
                        class="reserve-template-entity__base-picker" />
        </group>
      </div>

      <el-alert type="warning" :closable="false">
        <h4>All times here are in UTC</h4>
        Please take into account, that all times here should be filled <strong>in UTC</strong>
        instead of local base time zone.
      </el-alert>

      <group>
        <button-el @click="handleSave" label="Save" />
      </group>
    </vertical-form>
  </block>
</template>

<style lang="scss">
  .reserve-template-entity {
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
      .el-date-editor {
        max-width: 100px;
      }
    }
    &__duty-off {
      display: flex;
      align-items: center;
    }
    &__plus-one {
      margin-left: 10px;
    }
    &__base-picker {
      max-width: 100px;
    }

    &__changes-list {
      max-height: 60vh;
      overflow-y: auto;
      font-size: .95em;
    }

    &__change {
      margin-bottom: 5px;
    }
  }
</style>
