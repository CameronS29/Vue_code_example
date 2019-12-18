<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';
  import { DutyTypeNames } from 'store/modules/fdt/consts';

  import { vuexProperty } from 'utils/helpers';
  import { gmTime } from '../Common/manageMixin';

  const prop = vuexProperty({ attr: 'editableModel', mutation: 'updateEditable' });

  export default {
    name: 'DutyModal',
    components: {
      Modal,
      Card,
    },

    data() {
      return { DutyTypeNames };
    },

    computed: {
      ...mapState('fdt/sandbox', ['editableModel']),
      ...mapGetters('fdt/sandbox', ['hasEditableDuty', 'newModel']),
      ...mapGetters('airports', ['airports']),

      type: prop('type', { set: i => parseInt(i, 10) || null }),
      isActive: prop('active'),
      datetimeOn: prop('datetime_on', gmTime),
      datetimeOff: prop('datetime_off', gmTime),

      base: prop('base'),
    },

    methods: {
      ...mapMutations('fdt/sandbox', ['updateEditable', 'clearEditable']),
      ...mapActions('fdt/sandbox', ['saveDuty', 'deleteDuty']),

      async handleSaveDuty() {
        await this.saveDuty();
        this.clearEditable();
      },

      async handleDelete() {
        await this.deleteDuty(this.editableModel.id);
        this.clearEditable();
      },
    },
  };
</script>

<template>
  <modal :show="hasEditableDuty" @close="clearEditable">
    <card :title="newModel ? 'Add Duty' : 'Edit Duty'">
      <div class="fdt-sandbox-modal__fields">
        <div class="fdt-sandbox-modal__field">
          Type
          <el-select size="small" v-model="type" placeholder="Type (Flying if omit...)" clearable>
            <el-option v-for="(name, id) in DutyTypeNames" :key="id" :value="parseInt(id, 10)" :label="name" />
          </el-select>
        </div>

        <div class="fdt-sandbox-modal__field">
          Base
          <el-select v-model="base" size="small" placeholder="Base (optional...)" filterable clearable>
            <el-option v-for="({ id, iata }) in airports" :key="id" :value="id" :label="iata" />
          </el-select>
        </div>
      </div>

      <div class="fdt-sandbox-modal__fields">
        <div class="fdt-sandbox-modal__field">
          Time ON (UTC)
          <el-date-picker type="datetime"
                          format="MM/dd/yyyy HH:mm"
                          v-model="datetimeOn"
                          size="small"
                          :clearable="false" />
        </div>

        <div class="fdt-sandbox-modal__field">
          Time OFF
          <el-date-picker type="datetime"
                          format="MM/dd/yyyy HH:mm"
                          v-model="datetimeOff"
                          size="small"
                          :clearable="false" />
        </div>
      </div>

      <div class="fdt-sandbox-modal__fields">
        <el-checkbox v-model="isActive" label="Display in Schedule" />
      </div>

      <div class="fdt-sandbox-modal__buttons">
        <el-button v-if="!newModel" size="small" type="danger" @click="handleDelete">
          Delete
        </el-button>

        <el-button class="fdt-sandbox-modal__save" type="primary" size="small" @click="handleSaveDuty">
          Save
        </el-button>
        <el-button size="small" @click="clearEditable">Close</el-button>
      </div>
    </card>
  </modal>
</template>

<style lang="scss">
  .fdt-sandbox-modal {
    &__fields {
      display: flex;
      align-items: center;

      & > * {
        margin: 5px;
        flex: 1 1 auto;
      }
    }

    &__field {
      display: flex;
      flex-flow: column;
      flex: 1 1 100%;

      & > * {
        width: auto !important;
        flex: 1 1 auto;
      }
    }

    &__buttons {
      display: flex;
      margin: 10px 5px;
    }

    &__save.el-button {
      margin-left: auto;
    }
  }
</style>

