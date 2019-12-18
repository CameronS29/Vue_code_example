<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { vuexProperty } from 'utils/helpers';
  import { SET_EDITABLE_GROUP_FORM } from 'store/modules/scheduling/consts';

  const formField = vuexProperty({
    attr: 'groupEditForm',
    mutation: SET_EDITABLE_GROUP_FORM,
  });

  export default {
    name: 'GroupEditForm',

    created() {
      this.listPlainGroups();
    },

    computed: {
      ...mapState('scheduling/pairingTemplates', [
        'editablePairingTemplateGroupId',
        'groupEditForm',
      ]),
      ...mapGetters('scheduling/pairingTemplates', [
        'editablePairingTemplateGroup',
        'plainGroups',
        'isLoading',
      ]),

      name: formField('name'),
      nextGroup: formField('next_group'),
    },

    methods: {
      ...mapActions('scheduling/pairingTemplates', [
        'updatePairingTemplateGroup',
        'listPlainGroups',
      ]),

      ...mapMutations('scheduling/pairingTemplates', [
        SET_EDITABLE_GROUP_FORM,
      ]),

      async handleFormSave() {
        await this.updatePairingTemplateGroup();
        this.$emit('save');
      },
    },
  };
</script>

<template>
  <el-container>
    <div class="fdt-group-edit-form__container">
      <h3>Edit {{ editablePairingTemplateGroup.name }} Templates Group</h3>
    </div>

    <el-alert :closable="false" class="fdt-group-edit-form__description" title="">
      Enter new name and optional next linked group for <b>{{ editablePairingTemplateGroup.name }}</b>.
      <br>
      All existing shifts won't be renamed though.
    </el-alert>

    <div class="fdt-group-edit-form__container">
      <el-row :gutter="10" class="fdt-group-edit-form__row">
        <el-col :lg="6">
          <span class="fdt-group-edit-form__label">Name</span>
        </el-col>
        <el-col :lg="18">
          <el-input v-model="name" placeholder="Enter new name..." />
        </el-col>
      </el-row>

      <el-row :gutter="10" align="middle" class="fdt-group-edit-form__row">
        <el-col :lg="6">
          <span class="fdt-group-edit-form__label">Next Group</span>
        </el-col>
        <el-col :lg="18">
          <el-select placeholder="Enter group name (optional)..."
                     v-model="nextGroup"
                     clearable
                     filterable
                     class="fdt-group-edit-form__select">
            <el-option v-for="group in plainGroups"
                       :key="group.id"
                       :value="group.id"
                       :disabled="group.id === editablePairingTemplateGroupId"
                       :label="group.name">
              {{ group.name }}
            </el-option>
          </el-select>
        </el-col>
      </el-row>
    </div>

    <el-row type="flex" justify="end" class="fdt-group-edit-form__container fdt-group-edit-form__buttons">
      <el-button size="small" @click="$emit('cancel')">Cancel</el-button>
      <el-button size="small" type="primary" :loading="isLoading" @click="handleFormSave">Save</el-button>
    </el-row>
  </el-container>
</template>

<style lang="scss">
  .fdt-group-edit-form {

    &__container {
      padding: 10px 15px;
    }

    &__description {
      font-size: 1.1em;
      border-radius: 0;
    }

    &__label {
      line-height: 39px;
      font-weight: bold;
      display: block;
    }

    &__row {
      & + & {
        margin-top: 10px;
      }
    }

    &__select {
      width: 100%;
    }

    &__buttons {
      border-top: 1px solid #eee;
      background-color: #fafafa;
    }
  }
</style>
