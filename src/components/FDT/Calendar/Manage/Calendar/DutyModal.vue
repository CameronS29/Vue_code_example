<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { vuexProperty } from 'utils/helpers';
  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';

  import { gmTime } from '../Common/manageMixin';

  const dutyTypes = [
    [0, 'Reserve'],
    [1, 'Office'],
    [2, 'Training'],
    [3, 'Travel'],
  ];

  const prop = vuexProperty({ attr: 'editableDuty', mutation: 'setEditableDuty' });

  export default {
    name: 'DutyModal',

    components: {
      Modal,
      Card,
    },

    data() {
      return { dutyTypes };
    },

    computed: {
      ...mapState('fdt/duties', ['editableDuty']),
      ...mapGetters('fdt/duties', ['isLoading']),
      ...mapGetters('airports', ['airports']),

      duty_on: prop('duty_on', gmTime),
      duty_off: prop('duty_off', gmTime),
      base: prop('base'),
      type: prop('type'),

      title() {
        return this.editableDuty.id
          ? 'Edit Duty'
          : 'Add New Duty';
      },
    },

    methods: {
      ...mapActions('fdt/duties', ['saveDuty', 'deleteDuty']),
      ...mapMutations('fdt/duties', ['setEditableDuty']),

      handleCloseModal() {
        this.setEditableDuty({});
      },

      async handleSaveClick() {
        await this.saveDuty();
        this.handleCloseModal();
      },

      async handleDeleteClick() {
        await this.deleteDuty(this.editableDuty.id);
        this.handleCloseModal();
      },
    },
  };
</script>

<template>
  <modal :show="editableDuty.id !== undefined" @close="handleCloseModal">
    <card :title="title" v-loading="isLoading">
      <div class="fdt-duty-modal__fields">
        <div class="fdt-duty-modal__field">
          <div class="fdt-duty-modal__label">Type</div>
          <el-select size="small" v-model="type" placeholder="Type (optional)..." clearable>
            <el-option v-for="([type, name]) in dutyTypes" :key="type" :value="type" :label="name" />
          </el-select>
        </div>
        <div class="fdt-duty-modal__field">
          <div class="fdt-duty-modal__label">Base</div>
          <el-select size="small" v-model="base" placeholder="Base (optional)..." filterable clearable>
            <el-option v-for="({ id, iata }) in airports" :key="id" :value="id" :label="iata" />
          </el-select>
        </div>
      </div>

      <div class="fdt-duty-modal__fields">
        <div class="fdt-duty-modal__field">
          <div class="fdt-duty-modal__label">Duty On (UTC)</div>
          <el-date-picker type="datetime" format="MM/dd/yyyy HH:mm" v-model="duty_on" size="small" :clearable="false" />
        </div>
        <div class="fdt-duty-modal__field">
          <div class="fdt-duty-modal__label">Duty Off (UTC)</div>
          <el-date-picker type="datetime"
                          format="MM/dd/yyyy HH:mm"
                          v-model="duty_off"
                          size="small"
                          :clearable="false" />
        </div>
      </div>

      <div class="fdt-duty-modal__buttons">
        <el-button @click="handleDeleteClick" v-if="editableDuty.id" type="danger" size="small">Delete</el-button>
        <el-button class="fdt-duty-modal__close" @click="handleCloseModal" size="small">Close</el-button>
        <el-button @click="handleSaveClick" type="primary" size="small">Save</el-button>
      </div>
    </card>
  </modal>
</template>

<style lang="scss">
  .fdt-duty-modal {
    &__fields {
      display: flex;
      margin-bottom: 10px;

      & > * {
        flex: 1 1 auto;
        margin-left: 10px;

        &:first-child {
          margin-left: 0;
        }
      }
    }

    &__field {
      display: flex;
      flex-flow: column;
      padding: 2px;

      &:hover {
        background: #fafafa;
      }
    }

    &__buttons {
      display: flex;
    }

    &__label {
      margin-bottom: 2px;
      font-size: .9em;
      opacity: .7;
    }

    &__close {
      margin-left: auto !important;
    }

    .el-date-editor.el-input,
    .el-date-editor.el-input__inner {
      width: auto;
    }
  }
</style>
