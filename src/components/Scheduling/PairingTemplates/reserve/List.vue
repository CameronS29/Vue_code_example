<script>
  import { mapState, mapActions, mapMutations } from 'vuex';
  import { MessageBox } from 'element-ui';

  import ButtonEl from 'Common/Button';
  import Block from 'Common/Block.vue';

  import ReserveTable from './ReserveTable';
  import * as consts from '../../../../store/modules/scheduling/consts';
  import { tableNamespaceByTypeId, } from '../../../../store/modules/scheduling/templates/reserve';

  export default {
    props: {
      type: Number,
    },
    components: {
      ButtonEl,
      ReserveTable,
      Block,
    },
    computed: {
      ...mapState('scheduling/pairingTemplates/reserve', [
        'editableReserveTemplate',
      ]),
    },

    methods: {
      ...mapActions('scheduling/pairingTemplates/reserve', [
        'deleteReserveTemplate',
        'getTemplateChanges',
      ]),

      ...mapMutations('scheduling/pairingTemplates/reserve', [
        consts.SET_EDITABLE_RESERVE_TEMPLATE,
      ]),

      async refreshTable() {
        return this.$store.dispatch(`${tableNamespaceByTypeId(this.type)}/refreshResults`);
      },

      async handleAddNewReserve() {
        this[consts.SET_EDITABLE_RESERVE_TEMPLATE]({});
      },

      async handleEditReserveClick(template) {
        this[consts.SET_EDITABLE_RESERVE_TEMPLATE](template);
        if (template && template.id) {
          await this.getTemplateChanges(template.id);
        }
      },

      async handleDeleteReserveClick(template) {
        await MessageBox.confirm(
          `Are you really want to remove ${template.shortcut} template?`,
          'Template removing',
          {
            confirmButtonText: 'Yes',
            type: 'warning',
          },
        );

        await this.deleteReserveTemplate(template.id);
        await this.refreshTable();
      }
    }
  };
</script>

<template>
  <block class="reserve-templates">
    <div slot="title" class="reserve-templates__block-head">
      <button-el @click="handleAddNewReserve" label="Add" size="sm" />
      <portal-target :name="`reserve-templates-${type}-search-input`" />
    </div>

    <reserve-table
      :type="type"
      :search-portal="`reserve-templates-${type}-search-input`"
      @edit-reserve-click="handleEditReserveClick"
      @delete-reserve-click="handleDeleteReserveClick"
    />
  </block>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .reserve-templates {
    &__block-head {
      flex: 1 1 100%;
      width: 100%;
      display: flex;
      align-items: center;

      @media screen and (max-width: $screen-sm-max) {
        flex-flow: row wrap;
      }

      & > * {
        margin-right: 5px;
        &:last-child {
          margin-right: 0
        }
      }

      .vue-portal-target {
        flex: 1 1;
      }
    }
  }

</style>
