<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';
  import { FlightTypeNames } from 'store/modules/fdt/consts';

  import { vuexProperty } from 'utils/helpers';
  import { gmTime } from '../Common/manageMixin';

  const prop = vuexProperty({ attr: 'editableModel', mutation: 'updateEditable' });

  export default {
    name: 'FlightModal',
    components: {
      Modal,
      Card,
    },

    data() {
      return { FlightTypeNames };
    },

    computed: {
      ...mapState('fdt/sandbox', ['editableModel']),
      ...mapGetters('fdt/sandbox', ['hasEditableFlight', 'newModel']),
      ...mapGetters('airports', ['airports']),

      type: prop('type', { set: i => parseInt(i, 10) || null }),
      isActive: prop('active'),
      singlePilot: prop('single_pilot'),
      datetimeOn: prop('datetime_on', gmTime),
      datetimeOff: prop('datetime_off', gmTime),

      origin: prop('origin'),
      destination: prop('destination'),
      flightNumber: prop('flight_number'),
    },

    methods: {
      ...mapMutations('fdt/sandbox', ['updateEditable', 'clearEditable']),
      ...mapActions('fdt/sandbox', ['saveFlight', 'deleteFlight']),

      async handleSaveFlight() {
        await this.saveFlight();
        this.clearEditable();
      },

      async handleDelete() {
        await this.deleteFlight(this.editableModel.id);
        this.clearEditable();
      },
    },
  };
</script>

<template>
  <modal :show="hasEditableFlight" @close="clearEditable">
    <card :title="newModel ? 'Add Flight' : 'Edit Flight'">
      <div class="fdt-sandbox-modal__fields">
        <div class="fdt-sandbox-modal__field">
          Type
          <el-select size="small" v-model="type" placeholder="Type (OCF if omit...)" clearable>
            <el-option v-for="(name, id) in FlightTypeNames" :key="id" :value="parseInt(id, 10)" :label="name" />
          </el-select>
        </div>

        <div class="fdt-sandbox-modal__field">
          Flight Number
          <el-input size="small" v-model="flightNumber" placeholder="Flight # (optional...)" />
        </div>
      </div>

      <div class="fdt-sandbox-modal__fields">
        <div class="fdt-sandbox-modal__field">
          Duty ON
          <el-date-picker type="datetime" format="MM/dd/yyyy HH:mm" v-model="datetimeOn" size="small" :clearable="false" />
        </div>

        <div class="fdt-sandbox-modal__field">
          Duty OFF
          <el-date-picker type="datetime" format="MM/dd/yyyy HH:mm" v-model="datetimeOff" size="small" :clearable="false" />
        </div>
      </div>

      <div class="fdt-sandbox-modal__fields">
        <div class="fdt-sandbox-modal__field">
          Origin
          <el-select v-model="origin" size="small" placeholder="Origin (optional...)" filterable clearable>
            <el-option v-for="({ id, iata }) in airports" :key="id" :value="id" :label="iata" />
          </el-select>
        </div>

        <div class="fdt-sandbox-modal__field">
          Destination
          <el-select v-model="destination" size="small" placeholder="Destination (optional...)" filterable clearable>
            <el-option v-for="({ id, iata }) in airports" :key="id" :value="id" :label="iata" />
          </el-select>
        </div>
      </div>

      <div class="fdt-sandbox-modal__fields">
        <el-checkbox v-model="singlePilot" label="Single Pilot" />
        <el-checkbox v-model="isActive" label="Display in Schedule" />
      </div>

      <div class="fdt-sandbox-modal__buttons">
        <el-button v-if="!newModel" size="small" type="danger" @click="handleDelete">
          Delete
        </el-button>

        <el-button class="fdt-sandbox-modal__save" type="primary" size="small" @click="handleSaveFlight">Save</el-button>
        <el-button size="small" @click="clearEditable">Close</el-button>
      </div>
    </card>
  </modal>
</template>
