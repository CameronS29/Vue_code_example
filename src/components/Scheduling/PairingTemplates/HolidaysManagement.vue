<script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import { required } from 'vuelidate/lib/validators';

  import Block from 'Common/Block.vue';
  import VerticalForm from 'Common/Form/VerticalForm.vue';
  import Group from 'Common/Form/Group.vue';

  export default {
    name: 'HolidaysManagement',
    components: {
      Block,
      VerticalForm,
      Group,
    },

    data() {
      return {
        showDialog: false,

        id: undefined,
        date: new Date(),
        name: '',
      };
    },

    created() {
      return this.getHolidays();
    },

    computed: {
      ...mapState('scheduling/pairingTemplates/holidays', ['year', 'holidays']),
      ...mapGetters('scheduling/pairingTemplates/holidays', ['isLoading']),

      dialogTitle() {
        return (this.id !== undefined ? 'Edit Holiday' : 'New Holiday');
      },
    },

    methods: {
      ...mapActions('scheduling/pairingTemplates/holidays', [
        'getHolidays',
        'saveHoliday',
        'deleteHoliday',
      ]),

      handleYearChange(year) {
        this.getHolidays({ year });
      },

      async handleHolidayCreateClick() {
        this.$v.$touch();
        if (this.$v.$invalid) { return; }

        const { id, date, name } = this;
        await this.saveHoliday({ id, name, date });
        this.handleDialogClose();
      },

      handleDialogClose() {
        this.$v.$reset();
        this.id = undefined;
        this.name = '';
        this.showDialog = false;
      },

      handleDialogOpen({ id = this.id, date = this.date, name = this.name } = {}) {
        this.id = id;
        this.date = date;
        this.name = name;
        this.showDialog = true;
      },
    },

    validations: {
      date: { required },
      name: { required },
    },
  };
</script>

<template>
  <block class="fdt-holiday">
    <el-dialog :visible="showDialog"
               @close="handleDialogClose"
               :title="dialogTitle"
               width="30%">
      <vertical-form>
        <group label="Date" :validation-data="$v.date">
          <el-date-picker format="MM/dd/yyyy"
                          value-format="MM/dd/yyyy"
                          v-model="date"
                          placeholder="Date..."
                          style="width: 100%;" />
        </group>

        <group label="Name" :validation-data="$v.name">
          <el-input v-model="name" placeholder="Name..." />
        </group>
      </vertical-form>
      <div class="fdt-holiday__confirm-buttons">
        <el-button @click="handleDialogClose">Cancel</el-button>
        <el-button type="primary" @click="handleHolidayCreateClick">
          <span v-if="id === undefined">Create</span>
          <span v-else>Update</span>
        </el-button>
      </div>
    </el-dialog>

    <div slot="title" class="fdt-holiday__block-head">
      <el-date-picker :value="year"
                      @input="handleYearChange"
                      type="year"
                      size="small"
                      style="width: 100px" />
      <el-button type="primary" size="small" @click="handleDialogOpen">Add New Holiday</el-button>
    </div>

    <el-table :data="holidays" v-loading="isLoading">
      <el-table-column width="200" prop="date" label="Date" />
      <el-table-column prop="name" label="Name" />

      <el-table-column width="120">
        <template slot-scope="scope">
          <div class="fdt-holiday__edit-buttons">
            <el-button type="primary"
                       size="mini"
                       icon="el-icon-edit"
                       title="Edit"
                       @click="handleDialogOpen(scope.row)" />

            <el-button type="danger"
                       size="mini"
                       icon="el-icon-delete"
                       title="Delete"
                       @click="deleteHoliday(scope.row.id)" />

          </div>
        </template>
      </el-table-column>
    </el-table>
  </block>
</template>

<style lang="scss">
  .fdt-holiday {
    &__confirm-buttons {
      display: flex;
      justify-content: flex-end;
      padding-right: 20px;
    }

    &__edit-buttons {
      display: flex;
      justify-content: flex-end;
    }

    &__block-head {
      display: flex;
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
