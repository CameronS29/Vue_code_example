<script>
  import { mapState, mapActions, mapMutations } from 'vuex';
  import { debounce } from 'lodash';
  import { required } from 'vuelidate/lib/validators';

  import ButtonEl from 'Common/Button.vue';
  import Group from 'Common/Form/Group.vue';
  import VerticalForm from 'Common/Form/VerticalForm.vue';
  import TextField from 'Common/Form/Fields/TextField.vue';
  import { mapFormTextField } from '../../../store/helpers/forms';
  import * as consts from '../../../store/modules/scheduling/consts';

  export default {
    name: 'OffManagement',
    async created() {
      await this.fetchDayOffTypes();
    },

    components: {
      ButtonEl, Group, TextField, VerticalForm,
    },

    computed: {
      ...mapState('scheduling/pairingTemplates/off', [
        'dayOffTypes',
        'notSubmittedType',
        'loading',
      ]),
      ...mapFormTextField(
        'scheduling/pairingTemplates/off/notSubmittedType',
        `scheduling/pairingTemplates/off/${consts.UPDATE_NOT_SUBMITTED_DAY_OFF_FORM}`,
        ['abbr', 'name', 'total_included'],
      ),
      typesGrid() {
        return [...this.dayOffTypes, this.notSubmittedType];
      },
    },

    methods: {
      ...mapActions('scheduling/pairingTemplates/off', [
        'fetchDayOffTypes',
        'deleteDayOffType',
        'saveDayOffType',
      ]),
      ...mapMutations('scheduling/pairingTemplates/off', [consts.ADD_DAY_OFF_TYPE]),
      async handleRemove(row) {
        await this.deleteDayOffType(row.id);
      },
      async handleAdd() {
        this.$v.$touch();

        if (!this.$v.$invalid) {
          await this.saveDayOffType(this.notSubmittedType);
          await this.fetchDayOffTypes();

          this.abbr = '';
          this.name = '';
          this.$v.$reset();
        }
      },

      handleAbbrChange: debounce(async function (type, abbr) {
        await this.saveDayOffType({ ...type, abbr });
      }, 500),

      handleLabelChange: debounce(async function (type, name) {
        await this.saveDayOffType({ ...type, name });
      }, 500),

      async handleTotalChange(type, total_included) {
        Object.assign(type, { total_included });
        await this.saveDayOffType({ ...type, total_included });
      },
    },

    validations: {
      abbr: { required },
      name: { required },
    },
  };
</script>

<template>
  <div class="off-management" v-loading="loading">
    <vertical-form>
      <el-table :data="typesGrid">
        <el-table-column width="140" label="Abbr.">
          <template slot-scope="scope">
            <el-input v-if="scope.row.id"
                      :value="scope.row.abbr"
                      @input="handleAbbrChange(scope.row, ...arguments)" />
            <group :full-width="true" v-else :validation-data="$v.abbr">
              <text-field v-model="abbr"/>
            </group>
          </template>
        </el-table-column>

        <el-table-column label="Label">
          <template slot-scope="scope">
            <el-input v-if="scope.row.id"
                      :value="scope.row.name"
                      @input="handleLabelChange(scope.row, ...arguments)" />
            <group :full-width="true" v-else :validation-data="$v.name">
              <text-field v-model="name"/>
            </group>
          </template>
        </el-table-column>

        <el-table-column label="Payroll">
          <template slot-scope="scope">
            <div class="off-management__checkbox">
              <el-checkbox v-if="scope.row.id"
                           :value="scope.row.total_included"
                           @input="handleTotalChange(scope.row, ...arguments)"
                           label="Include in Totals" />
              <el-checkbox v-else v-model="total_included" label="Include in Totals" />
            </div>
          </template>
        </el-table-column>

        <el-table-column width="58">
          <template slot-scope="scope">
            <button-el v-if="scope.row.id" size="sm" type="danger" icon="trash" @click="handleRemove(scope.row)" />
          </template>
        </el-table-column>
      </el-table>

      <button-el size="sm" class="off-management__add-btn" @click="handleAdd">Add</button-el>
    </vertical-form>
  </div>
</template>

<style lang="scss">
  .off-management {
    &__unsubmitted-group {
    }
    &__add-btn {
      margin: 10px 18px;
    }
    &__checkbox {
      margin-top: 0;
      margin-bottom: -7px;

      & + & {
        margin-top: -7px;
      }
    }
  }
</style>
