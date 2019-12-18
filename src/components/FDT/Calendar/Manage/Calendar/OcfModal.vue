<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { vuexProperty } from 'utils/helpers';
  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';

  import { gmTime } from '../Common/manageMixin';

  const prop = vuexProperty({ attr: 'editableOCF', mutation: 'setEditableOCF' });

  export default {
    name: 'OcfModal',

    components: {
      Modal,
      Card,
    },

    computed: {
      ...mapState('fdt/ocf', ['editableOCF']),
      ...mapGetters('fdt/ocf', ['isLoading']),

      datetimeOn: prop('datetime_on', gmTime),
      datetimeOff: prop('datetime_off', gmTime),
      nightLanded: prop('night_landed'),

      title() {
        return this.editableOCF.id
          ? 'Edit Other Commercial Flight'
          : 'Add Other Commercial Flight';
      },

    },

    methods: {
      ...mapActions('fdt/ocf', ['saveOCF', 'deleteOCF']),
      ...mapMutations('fdt/ocf', ['setEditableOCF']),

      handleCloseModal() {
        this.setEditableOCF({});
      },

      async handleSaveClick() {
        await this.saveOCF();
        this.handleCloseModal();
      },

      async handleDeleteClick() {
        this.deleteOCF(this.editableOCF.id);
        this.handleCloseModal();
      },
    },
  };
</script>

<template>
  <modal :show="editableOCF.id !== undefined" @close="handleCloseModal">
    <card :title="title" v-loading="isLoading">
      <div class="fdt-duty-modal__fields">
        <div class="fdt-duty-modal__label">Time On (UTC)</div>
        <el-date-picker type="datetime"
                        format="MM/dd/yyyy HH:mm"
                        v-model="datetimeOn"
                        size="small"
                        :clearable="false" />
      </div>
      <div class="fdt-duty-modal__fields">
        <div class="fdt-duty-modal__label">Time Off (UTC)</div>
        <el-date-picker type="datetime"
                        format="MM/dd/yyyy HH:mm"
                        v-model="datetimeOff"
                        size="small"
                        :clearable="false" />
      </div>

      <div class="fdt-duty-modal__fields">
        <el-checkbox label="Night Landing" v-model="nightLanded" />
      </div>

      <div class="fdt-duty-modal__buttons">
        <el-button v-if="editableOCF.id" @click="handleDeleteClick" type="danger" size="small">Delete</el-button>
        <el-button class="fdt-duty-modal__close" @click="handleCloseModal" size="small">Close</el-button>
        <el-button @click="handleSaveClick" type="primary" size="small">Save</el-button>
      </div>
    </card>
  </modal>
</template>
